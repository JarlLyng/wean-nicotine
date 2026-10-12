// Encode a simulator screen recording into the site's small, silent H.264 loop (#396).
//
//   swift scripts/encode-loop.swift <in.mov> <out.mp4> <width> <kbps> [start] [duration] [poster.jpg] [posterAt]
//
// Uses only AVFoundation, which ships with macOS, so nothing has to be
// installed. Drops any audio, scales to the given width (height follows the
// aspect), trims to [start, start + duration] seconds, and optionally writes a
// poster frame as JPEG. The site loop should stay a few hundred KB.
import AVFoundation
import AppKit

let args = CommandLine.arguments
guard args.count >= 5, let width = Int(args[3]), let kbps = Int(args[4]) else {
    print("usage: encode-loop.swift <in.mov> <out.mp4> <width> <kbps> [start] [duration] [poster.jpg] [posterAt]")
    exit(1)
}
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
let start = args.count > 5 ? Double(args[5]) ?? 0 : 0
let duration = args.count > 6 ? Double(args[6]) : nil
let posterPath = args.count > 7 ? args[7] : nil
let posterAt = args.count > 8 ? Double(args[8]) ?? start : start

let asset = AVURLAsset(url: input)
let sem = DispatchSemaphore(value: 0)
var failure: String?

Task {
    do {
        guard let track = try await asset.loadTracks(withMediaType: .video).first else { throw NSError(domain: "no video", code: 1) }
        let natural = try await track.load(.naturalSize)
        let height = Int((Double(width) * Double(natural.height) / Double(natural.width) / 2).rounded()) * 2

        let reader = try AVAssetReader(asset: asset)
        let total = try await asset.load(.duration)
        let from = CMTime(seconds: start, preferredTimescale: 600)
        let length = duration.map { CMTime(seconds: $0, preferredTimescale: 600) } ?? CMTimeSubtract(total, from)
        // Read from the top, so the still frame a stretch began with is not skipped.
        reader.timeRange = CMTimeRange(start: .zero, end: CMTimeAdd(from, length))
        let readerOut = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
        reader.add(readerOut)

        try? FileManager.default.removeItem(at: output)
        let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
        writer.shouldOptimizeForNetworkUse = true
        let writerIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: width,
            AVVideoHeightKey: height,
            AVVideoScalingModeKey: AVVideoScalingModeResizeAspectFill,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: kbps * 1000,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                AVVideoMaxKeyFrameIntervalKey: 60,
            ],
        ])
        writerIn.expectsMediaDataInRealTime = false
        writer.add(writerIn)

        reader.startReading()
        writer.startWriting()
        writer.startSession(atSourceTime: from)
        func append(_ sample: CMSampleBuffer) async throws {
            while !writerIn.isReadyForMoreMediaData { try await Task.sleep(nanoseconds: 2_000_000) }
            writerIn.append(sample)
        }
        // The simulator only writes a frame when the screen changes, so a still
        // stretch is one frame that began before `start`. Keep the last such
        // frame and move it to `start`, or the loop would open on nothing.
        var still: CMSampleBuffer?
        while let sample = readerOut.copyNextSampleBuffer() {
            let pts = CMSampleBufferGetPresentationTimeStamp(sample)
            guard pts.isNumeric else { continue }
            if CMTimeCompare(pts, from) < 0 { still = sample; continue }
            if let pending = still {
                still = nil
                if CMTimeCompare(pts, from) > 0 {
                    var timing = CMSampleTimingInfo(duration: .invalid, presentationTimeStamp: from, decodeTimeStamp: .invalid)
                    var moved: CMSampleBuffer?
                    CMSampleBufferCreateCopyWithNewTiming(allocator: nil, sampleBuffer: pending, sampleTimingEntryCount: 1, sampleTimingArray: &timing, sampleBufferOut: &moved)
                    if let moved { try await append(moved) }
                }
            }
            try await append(sample)
        }
        writerIn.markAsFinished()
        writer.endSession(atSourceTime: CMTimeAdd(from, length))
        await writer.finishWriting()
        if writer.status != .completed { throw writer.error ?? NSError(domain: "write failed", code: 2) }

        if let posterPath {
            let gen = AVAssetImageGenerator(asset: AVURLAsset(url: output))
            gen.appliesPreferredTrackTransform = true
            gen.requestedTimeToleranceBefore = .zero
            gen.requestedTimeToleranceAfter = .zero
            let (image, _) = try await gen.image(at: CMTime(seconds: max(0, posterAt - start), preferredTimescale: 600))
            let rep = NSBitmapImageRep(cgImage: image)
            let jpeg = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.82])!
            try jpeg.write(to: URL(fileURLWithPath: posterPath))
        }
        let size = (try FileManager.default.attributesOfItem(atPath: output.path)[.size] as? Int) ?? 0
        print("wrote \(output.lastPathComponent): \(width)x\(height), \(size / 1024) KB")
    } catch {
        failure = "\(error)"
    }
    sem.signal()
}
sem.wait()
if let failure { print("failed: \(failure)"); exit(1) }
