import { useEffect } from 'react';
import { getExplorerContext } from '../../../contexts/ExplorerContext';
import './ToolBar.css'
import { MdOutlineDelete , MdOutlineFolderCopy , MdPostAdd  } from "react-icons/md";
import Spinner from '../../Spinner/Spinner';
import type { SearchItem } from '../../../interfaces/Explorer';
import { MANAGE_ACTION, PATH_DEFAULT_HOME, ROUTE_STRING } from '../../../helpers/Constants';
import { useNavigate } from 'react-router-dom';

function ToolBar() {
    const { 
        searchText, setSearchText, isSearching, searchItems, setSelectedSearchItemId, setPage, 
        selectedItems, paths, setPaths, setCurrentParentId, fetchSearchResult, manageContent
    } = getExplorerContext(); 

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
        setSelectedSearchItemId(null);
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (searchText.length > 2) {
            fetchSearchResult();
        }
    }, [searchText]); 

    const handleSearchItemClick = (item: SearchItem) => {
        setSearchText('');
        setPage(Number(item.page));
        setCurrentParentId(item.parent_id);
        setSelectedSearchItemId(item.id);

        const newPaths = [...PATH_DEFAULT_HOME, ...JSON.parse(item.path_json)];
        setPaths(newPaths);

        const newId = item.parent_id;
        navigate(newId ? ROUTE_STRING.FOLDER(newId) : ROUTE_STRING.HOME);
    }

    const handleAddFolderClick = () => {
        const input = window.prompt("Please enter folder name:");
        if(!input) {
            return;
        }

        const path = '/' + paths.slice(1).map(path => path.id).join('/');
        const json = JSON.stringify({name: input, path: path});
        manageContent(MANAGE_ACTION.ADD_FOLDER, json);
    }

    const handleAddFileClick = () => {
        const input = window.prompt("Please enter file name, with extension in lower case:");
        if(!input) {
            return;
        }

        const path = '/' + paths.slice(1).map(path => path.id).join('/');
        const json = JSON.stringify({name: input, path: path});
        manageContent(MANAGE_ACTION.ADD_FILE, json);
    }

    const handleDeleteClick = () => {
        if(selectedItems.length === 0) {
            alert('Select files or folders first you want to delete.');
            return;
        }

        const question = window.confirm(`Do you really want to delete these ${selectedItems.length} items?`);
        if (question) {
            const selectedIds = selectedItems.map(item => item.id);
            const json = JSON.stringify({selectedIds: selectedIds});
            manageContent(MANAGE_ACTION.DELETE, json);
        } 
    }

    return (
        <>
            <div className='toolbar-container'>
                <div className='toolbar-button' onClick={handleAddFolderClick}>
                    <MdOutlineFolderCopy size={20} />
                    <span>Add folder</span>
                </div>
                <div className='toolbar-button' onClick={handleAddFileClick}>
                    <MdPostAdd size={20} />
                    <span>Add file</span>
                </div>
                <div className='toolbar-button' onClick={handleDeleteClick}>
                    <MdOutlineDelete size={20} />
                    <span>Delete</span>
                </div>
                <div className='toolbar-expand' />
                <div className='toolbar-search'>
                    <input type="text" value={searchText} onChange={handleSearchChange} placeholder='Search for files...'/>
                    {searchText.length > 2 &&
                        <div className='toolbar-search-results-container'>
                            {isSearching && <Spinner />}
                            <ul>
                            {
                                searchItems.map(item => {
                                    const path: SearchItem[] = JSON.parse(item.path_json);
                                    const pathString: string = PATH_DEFAULT_HOME[0].name + '/' + path.map(item => item.name).join('/');

                                    return (
                                        <li key={item.id} onClick={() => handleSearchItemClick(item)}>{item.name}<span>{pathString}</span></li>
                                    )
                                })
                            }
                            </ul>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default ToolBar