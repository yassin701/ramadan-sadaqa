export default function Loading() {
    return (
        <div className="flex h-full items-center justify-center p-12">
            <div className="space-y-6 w-full max-w-md">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-1/3" />
                    <div className="h-8 bg-slate-100 rounded-full animate-pulse w-8" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                    <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                </div>
                <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
        </div>
    );
}
