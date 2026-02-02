export default function Loading() {
    return (
        <div className="flex h-full items-center justify-center bg-slate-50/50 p-6">
            <div className="space-y-4 w-full max-w-sm">
                <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-1/2 mx-auto" />
                <div className="space-y-2">
                    <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                    <div className="h-20 bg-slate-200 rounded-xl animate-pulse opacity-50" />
                </div>
            </div>
        </div>
    );
}
