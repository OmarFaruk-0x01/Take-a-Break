import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Header() {
    const handleMinimize = async () => {
        try {
            const window = getCurrentWindow();
            await window.minimize();
        } catch (error) {
            console.error("Failed to minimize window:", error);
        }
    };

    const handleClose = async () => {
        try {
            const window = getCurrentWindow();
            await window.close();
        } catch (error) {
            console.error("Failed to close window:", error);
        }
    };

    return <div style={{ backgroundColor: 'white' }}>
        <div
            className="relative flex items-center justify-between px-4 py-2 cursor-move select-none w-full gap-x-4"
            data-tauri-drag-region
        >
            <div className="flex py-2 items-center space-x-2">
                <button onClick={handleClose} data-tauri-drag-region="false" className="w-3 h-3 bg-red-500 rounded-full cursor-pointer"></button>
                <button onClick={handleMinimize} data-tauri-drag-region="false" className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer"></button>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center space-y-0" >
                <h1 className="text-lg font-bold" data-tauri-drag-region>Take a Break</h1>
            </div>
        </div>
    </div>
}