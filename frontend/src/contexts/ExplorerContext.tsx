import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/ApiService';
import type { ExplorerContextType } from '../interfaces/ExplorerContext';
import type { ExplorerItem, SearchItem } from '../interfaces/Explorer';
import type { NavigationItem } from '../interfaces/Navigation';
import { PATH_DEFAULT_HOME, ROUTE_STRING } from '../helpers/Constants';
import { useNavigate } from 'react-router-dom';

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

export function ExplorerContextProvider({ children }: { children: ReactNode }) {
    const [paths, setPaths] = useState<NavigationItem[]>(PATH_DEFAULT_HOME);
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [items, setItems] = useState<ExplorerItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<ExplorerItem[]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [limit] = useState<number>(50);
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
    const [selectedSearchItemId, setSelectedSearchItemId] = useState<string | null>(null);

    const navigate = useNavigate();

    const addPath = (item: NavigationItem) => {
        setCurrentParentId(item.id);
        setSelectedItems([]);
        setPage(1);
        setPaths((current) => [...current, item]);
        navigate(ROUTE_STRING.FOLDER(item.id));
    };

    const removePath = () => {
        const newId: string | null = paths.at(-2)?.id ?? null;
        setCurrentParentId(newId);
        setSelectedItems([]);
        setPage(1);
        setPaths((current) => current.length > 1 ? current.slice(0, -1) : current);
        navigate(newId ? ROUTE_STRING.FOLDER(newId) : ROUTE_STRING.HOME);
    }

    const trimPath = (id: string | null) => {
        let index = paths.findIndex(path => path.id === id);
        if(index >= 0) {
            const newId: string | null = paths.at(index)?.id ?? null;
            setPage(1);
            setCurrentParentId(newId);
            setPaths((current) => current.length > 1 ? current.slice(0, index + 1) : current);
            setSelectedItems([]);
            navigate(newId ? ROUTE_STRING.FOLDER(newId) : ROUTE_STRING.HOME);
        } 
    }

    const addSelectItem = (id: string) => {
        const item = items.find(item => item.id == id);
        if(item) {
            setSelectedItems([...selectedItems, item]);
        }
    }

    const removeSelectItem = (id: string) => {
        const newSelectedItems = selectedItems.filter(item => item.id !== id);
        setSelectedItems(newSelectedItems);
    }

    const firstPage = () => {
        setPage(1);
    }

    const nextPage = () => {
        let newPage: number = page + 1;
        if(newPage > maxPage) {
            newPage = maxPage;
        }
        setPage(newPage);
    }

    const previousPage = () => {
        let newPage: number = page -1;
        if(newPage < 1) {
            newPage = 1;
        }
        setPage(newPage);
    }

    const lastPage = () => {
        setPage(maxPage);
    }

    const customPage = (custom: number) => {
        let newPage: number = custom;

        if(newPage < 1) {
            newPage = 1;
        }
        if(newPage > maxPage) {
            newPage = maxPage;
        }
        setPage(newPage);
    }

    const fetchData = async () =>
    {
        const timer = setTimeout(() => {
            setIsLoading(true);
        }, 100); // Show only after 100ms
        
        try {
            const response = await apiService.get('/api/contents', {
                params: {
                    parentId: currentParentId,
                    page: page,
                    limit: limit
                }
            });
            setTotalRows(response.data.totalRows);
            setMaxPage(Math.ceil(response.data.totalRows / limit) || 1);
            setItems(response.data?.data ?? []); 
            } catch (exception) {
                const error: any = exception;
                console.log('Error while fetching data from the server:', error.message);
            } finally {
                setIsLoading(false);
                clearTimeout(timer);
            }
    }

    const fetchSearchResult = async () =>
    {
        const timer = setTimeout(() => {
        setIsSearching(true);
        }, 100); // Show only after 100ms
        
        try {
            const response = await apiService.get('/api/search', {
                params: {
                    term: searchText,
                    parentId: currentParentId,
                    limit: limit
                }
            });
            setSearchItems(response.data.data);
        } catch (exception) {
            const error: any = exception;
            console.log('Error while fetching search results from the server:', error.message);
        } finally {
            setIsSearching(false);
            clearTimeout(timer);
        }
    }

    const manageContent = async (action: string, data: string) => {
        const timer = setTimeout(() => {
            setIsLoading(true);
        }, 100); // Show only after 100ms
    
        try {
            const response = await apiService.post('/api/manage', {
                action: action, 
                data: data, 
                parentId: currentParentId
            });

            if(response.data.isError) {
                alert(`ERROR: ${response.data.errorMessage}`);
            } else {
                fetchData();
            }
        } catch (exception) {
            const error: any = exception;
            console.log('Error while managing data on the server:', error.message);
        } finally {
            setIsLoading(false);
            clearTimeout(timer);
        }
    }

    return (
        <ExplorerContext.Provider value={{ 
            paths, setPaths, setCurrentParentId, items, selectedItems, totalRows, limit, page, setPage, maxPage, currentParentId, isLoading, searchText, 
            isSearching, searchItems, setSearchText, selectedSearchItemId, setSelectedSearchItemId, firstPage, nextPage, previousPage, lastPage, 
            customPage, addPath, removePath, trimPath, addSelectItem, removeSelectItem, fetchData, fetchSearchResult, manageContent
        }}>
            {children}
        </ExplorerContext.Provider>
    );
}

export function getExplorerContext() {
    const context = useContext(ExplorerContext);
    if (!context) throw new Error('getExplorerContext must be used within a ExplorerContextProvider!');
    return context;
}