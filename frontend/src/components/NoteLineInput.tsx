import React from 'react';

type NoteLineInputProps = {
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    inputRef?: (el: HTMLInputElement | null) => void;
};

export const NoteLineInput: React.FC<NoteLineInputProps> = ({ value, onChange, onKeyDown, inputRef }) => (
    <input
        value={value}
        className="w-full text-black bg-white border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2"
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        ref={inputRef}
    />
);
