export interface ExplorerItem {
    id: string,
    name: string,
    is_folder: string,
    mime_type: string | null,
    size_bytes: number | null,
    created_at: Date,
    updated_at: Date | null
}

export interface SearchItem {
    id: string,
    name: string,
    parent_id: string,
    path_json: string,
    page: number
}