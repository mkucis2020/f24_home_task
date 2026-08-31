import './ListView.css'
import { useEffect, useRef } from 'react';
import { BsFolder2, BsFileEarmark } from "react-icons/bs";
import { getExplorerContext } from '../../../contexts/ExplorerContext';
import StatusBar from '../StatusBar/StatusBar';
import { formatFileSize } from '../../../helpers/HelperFunctions';
import Spinner from '../../Spinner/Spinner';
import type { ExplorerItem } from '../../../interfaces/Explorer';

function ListView() {
    const { 
        paths, items, selectedItems, selectedSearchItemId, page, addPath, fetchData, addSelectItem, removeSelectItem, isLoading 
    } = getExplorerContext(); 

    const targetRowRef  = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchData();
    }, [paths, page]);

    useEffect(() => {
        if (items.length > 0 && targetRowRef.current) {
            targetRowRef.current.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }, [items]);

    const handleRowClick = (item: ExplorerItem) => {
        if(item.is_folder === 't') {
            addPath({id: item.id, name: item.name});
        }
    }

    const handleCheckboxClick = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        event.stopPropagation();
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, item: ExplorerItem) => {
        event.stopPropagation();

        let currentValue = event.target.checked;
        if(currentValue) {
            addSelectItem(item.id);
        } else {
            removeSelectItem(item.id);
        }
    }

    return (
        <>
            <div className='listview-container'>
                <div className="listview-header listview-row">
                    <div></div>
                    <div>Name</div>
                    <div>Type</div>
                    <div>Modified</div>
                    <div>Size</div>
                </div>
                
                {isLoading && <Spinner />}

                <div className="listview-body">
                    {items?.map((item) => {
                        let isSelected = selectedItems.some(items => items.id === item.id)
                        
                        return (
                            <div key={item.id} className={`listview-row ${item.id === selectedSearchItemId ? 'search-result' : ''} ${isSelected ? 'selected' : ''}`} 
                                onClick={() => handleRowClick(item)} ref={item.id === selectedSearchItemId ? targetRowRef : null}>

                                <div className="checkRow"><input type="checkbox" checked={isSelected} onClick={handleCheckboxClick}
                                    onChange={(event) => handleCheckboxChange(event, item)} />
                                </div>
                                <div className='center-contents'>
                                    {item.is_folder === 't' ? 
                                        <BsFolder2 size={25}/> : <BsFileEarmark size={25}
                                    />}
                                    <span>{item.name}</span>
                                </div>
                                <div>{item.is_folder == 't' ? "Folder" : item.mime_type}</div>
                                <div>{(item.updated_at ?? item.created_at)?.toString()}</div>
                                <div>{formatFileSize(item.size_bytes)}</div>
                            </div>
                        )}
                    )}
                </div>
                
                <StatusBar />
            </div>
        </>
    )
}

export default ListView