export default function InputError({ message, className = "", ...props }) {
    return message ? (
        <div
            {...props}
            className="p-4 mb-4 text-sm text-center text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
            role="alert"
        >
            <span className="font-medium">Error!</span> {message}
        </div>
    ) : null;
}
