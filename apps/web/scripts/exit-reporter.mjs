export default class ExitReporter {
  onEnd(result) {
    if (process.platform !== "win32") return;

    // This reporter is configured after the list and HTML reporters, so their
    // artifacts are complete. Chromium can otherwise leave inherited Windows
    // handles open indefinitely after the report is finished.
    process.exit(result.status === "passed" ? 0 : 1);
  }
}
