import type { NavigationItem } from "../interfaces/Navigation";

export const PATH_DEFAULT_HOME:NavigationItem[] = [{id: null, name: "Home"}];

export const ROUTE_STRING = {
    HOME: '/folders/home',
    FOLDER: (id: string | null): string => `/folders/${id}`,
};

export const MANAGE_ACTION = {
    ADD_FOLDER: "ADD_FOLDER",
    ADD_FILE: 'ADD_FILE',
    DELETE: 'DELETE'
}