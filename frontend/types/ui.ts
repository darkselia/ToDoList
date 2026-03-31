export type ToastType = 'success' | 'error' | 'info';
export type ToastState = {
    type: ToastType;
    text: string;
};