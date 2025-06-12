export declare function fetchEventsOverView(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function fetchActionsList(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>): Promise<string[]>;
    

export declare function fetchActionsList(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function fetchProjectorList(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    criteria: Ref<string>,
    page: Ref<number>,
    size: Ref<number>,
    classroom: Ref<string>,
    floor: Ref<string>,
    isTurnedOn: Ref<string>,
    model: Ref<string>
    ): Promise<string[]>;

export declare function fetchSelectedFloorClassrooms(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    floorParam: Ref<string>
    ): Promise<string[]>;

export declare function fetchProjectorModelsList(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    floorParam: Ref<string>
    ): Promise<string[]>;

export declare function fetchEventStates(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    floorParam: Ref<string>
    ): Promise<string[]>;


export declare function fetchEvents(toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    floorParam: Ref<string>,
    page: Ref<number>,
    size: Ref<number>,
    requestBody: Ref<any>
    ): Promise<string[]>;

export declare function deleteProjectors(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    selectedProjectorsList: Ref<string[]>
    ): Promise<string[]>;

export declare function deleteAllProjectors(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    selectedProjectorsList: Ref<string[]>
    ): Promise<string[]>;

export declare function fetchActionsPage(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    page: Ref<number>,
    size: Ref<number> ): Promise<string[]>;

export declare function deleteActions(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    selectedActions: Ref<string[]>): Promise<string[]>;

export declare function fetchCommandsPage(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    page: Ref<number>,
    size: Ref<number>,
    modelname: Ref<string | null | undefined>,
    action: Ref<string | null | undefined>
): Promise<string[]>;

export declare function deleteSelectedCommands(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>,
    selectedCommands: Ref<string[]>): Promise<string[]>;
