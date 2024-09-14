export declare function guardarUserInfoEnSesion(usuario: string): Promise<Object> ;

export declare function obtenerUserInfoEnSesion(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<any>;

export declare function guardarUserUidEnSesion(userUid: string): Promise<void> ;

export declare function obtenerUserUidEnSesion(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<string>;