
// Trace() doesn't print the message in IE, so for that case we need to wrap it
export function traceForIE() {
    if (console.log) {
        if (console.log.apply) {
            console.log.apply(console, arguments);
        } else {
            // In old IE, native console methods themselves don't have apply().
            Function.prototype.apply.apply(console.log, [console, arguments]);
        }
    }
    if (console.trace) console.trace();
}

export const isIE = (typeof window !== undefined) && (typeof window.navigator !== undefined) && (
    /Trident\/|MSIE /.test(window.navigator.userAgent)
);
