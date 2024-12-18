import  { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import axios from 'axios';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

const Table = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArtworks, setTotalArtworks] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const overlayPanelRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  const fetchArtworks = async (page: number) => {
    const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
    setArtworks(response.data.data);
    setTotalArtworks(response.data.pagination.total);
  };

  const handlePageChange = (event: any) => {
    setCurrentPage(event.page + 1);
  };

  useEffect(() => {
    const selectArtworksAcrossPages = async (count: number) => {
      const selected: any[] = [];
      let remaining = count;
      let page = 1;

      while (remaining > 0 && (page - 1) * 10 < totalArtworks) {
        const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
        const artworksOnPage = response.data.data;

        const artworksToSelect = artworksOnPage.slice(0, remaining);
        selected.push(...artworksToSelect);
        remaining -= artworksToSelect.length;
        page++;
      }

      setSelectedArtworks(selected);
    };

    if (rowCount !== null && rowCount > 0) {
      selectArtworksAcrossPages(rowCount);
    } else {
      setSelectedArtworks([]);
    }
  }, [rowCount, totalArtworks]);

  return (
    <div>
      <DataTable
        value={artworks}
        paginator={false}
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value)}
        dataKey="id"
        className="p-datatable-sm"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="title" header={
          <span>
            <i
              className="pi pi-chevron-down"
              style={{ cursor: 'pointer' }}
              onClick={(e) => overlayPanelRef.current?.toggle(e)}
            />
            Title
          </span>
        } />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <Paginator
        first={(currentPage - 1) * 10}
        rows={10}
        totalRecords={totalArtworks}
        onPageChange={handlePageChange}
      />

      <OverlayPanel ref={overlayPanelRef}>
        <div className="flex flex-column align-items-start">
          <InputNumber
            inputId="selectRows"
            placeholder="Select Rows"
            value={rowCount || undefined}
            onValueChange={(e) => setRowCount(e.value || 0)}
            max={totalArtworks}
          />
          <div className="flex justify-content-center mt-2 ml-7">
            <Button label="Submit" outlined className="ml-8" />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
};

export default Table;