import { Spinner } from "@heroui/react";

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center w-full h-full p-5 mt-2">
            <Spinner size="lg" label="Loading" labelColor="primary"></Spinner>
        </div>
    );
}
