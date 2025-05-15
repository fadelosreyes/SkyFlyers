export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-[#f36430] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-[#d95e2a] focus:bg-[#d95e2a] focus:outline-none focus:ring-2 focus:ring-[#f36430] focus:ring-offset-2 active:bg-[#d95e2a] ${
                    disabled ? 'opacity-25' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
