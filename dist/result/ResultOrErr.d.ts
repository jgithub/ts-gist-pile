export type ResultOrErr<T, E = Error> = {
    okFlag: true;
    result: T;
} | {
    okFlag: false;
    err: E;
};
