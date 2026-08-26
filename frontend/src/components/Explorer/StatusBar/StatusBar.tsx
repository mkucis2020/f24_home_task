import { getExplorerContext } from '../../../contexts/ExplorerContext';
import { BsChevronDoubleLeft , BsChevronLeft, BsChevronDoubleRight, BsChevronRight } from "react-icons/bs";
import './StatusBar.css'

function StatusBar() {
    const { totalRows, selectedItems, page, maxPage, firstPage, nextPage, previousPage, customPage, lastPage } = getExplorerContext(); 

    return (
        <>
            <div className='status-bar-container'>
                <div className="status-bar-group">
                    <div>Total items: {totalRows}</div>
                    {selectedItems.length > 0 && <div>Selected items: {selectedItems.length}</div>}
                </div>
                <div className='status-bar-expand' />
                <div className='status-bar-button' title="First page" onClick={() => firstPage()}><BsChevronDoubleLeft/></div>
                <div className='status-bar-button' title="Previous page" onClick={() => previousPage()}><BsChevronLeft/></div>

                <div className="status-bar-group">
                    <div className='status-bar-text'><span>Page: </span><input type="text" value={page} onChange={(e) => customPage(Number(e.target.value))} /></div>
                    <div className='status-bar-label'><span>/ {maxPage}</span></div>
                </div>
                
                <div className='status-bar-button' title="Next page" onClick={() => nextPage()}><BsChevronRight/></div>
                <div className='status-bar-button' title="Last page" onClick={() => lastPage()}><BsChevronDoubleRight/></div>
            </div>
        </>
    )
}

export default StatusBar