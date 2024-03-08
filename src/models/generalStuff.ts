export type Result<T, E> = {
    tag: 'Ok';
    value: T;
} | {
    tag: 'Err';
    error: E;
};