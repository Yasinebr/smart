'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

// A helper function to create comparators for sorting
function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// A generic DataTable component
const DataTable = ({
  title,
  rows = [],
  columns = [],
  loading = false,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onSearch,
  searchPlaceholder = 'جستجو...',
  initialSortBy = '',
  selectable = true,
  toolbarActions = null,
}) => {
  // State
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(initialSortBy);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Event handlers
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id) => {
    if (!selectable) return;

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Calculate the slice of rows to display based on pagination settings
  const visibleRows = rows
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Check if search term matches any column in a row
  const matchesSearch = (row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    for (const column of columns) {
      const value = row[column.id];
      if (value && String(value).toLowerCase().includes(term)) {
        return true;
      }
    }
    return false;
  };

  // Filter rows by search term
  const filteredRows = searchTerm
    ? rows.filter(matchesSearch)
    : rows;

  // Empty rows to maintain consistent table height
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

  return (
    <Box className="w-full">
      <Paper className="w-full mb-4">
        <Toolbar
          className={`px-4 py-4 ${
            selected.length > 0 ? 'bg-primary bg-opacity-10' : ''
          }`}
        >
          {selected.length > 0 ? (
            <Typography
              color="inherit"
              variant="subtitle1"
              component="div"
              className="flex-grow"
            >
              {selected.length} مورد انتخاب شده
            </Typography>
          ) : (
            <Typography
              variant="h6"
              id="tableTitle"
              component="div"
              className="flex-grow font-bold"
            >
              {title}
            </Typography>
          )}

          {selected.length > 0 ? (
            <Tooltip title="حذف">
              <IconButton onClick={() => onDelete && onDelete(selected)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Box className="flex gap-2">
              <TextField
                placeholder={searchPlaceholder}
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {toolbarActions}

              <Tooltip title="فیلتر">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="بارگذاری مجدد">
                <IconButton onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="افزودن">
                <IconButton color="primary" onClick={onAdd}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < rows.length}
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                )}

                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'right'}
                    padding={column.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === column.id ? order : false}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}

                <TableCell align="center">عملیات</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={selectable ? columns.length + 2 : columns.length + 1}
                    align="center"
                    className="py-12"
                  >
                    <CircularProgress />
                    <Typography className="mt-2">در حال بارگذاری...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={selectable ? columns.length + 2 : columns.length + 1}
                    align="center"
                    className="py-12"
                  >
                    <Typography>داده‌ای یافت نشد</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={() => handleClick(row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      className={isItemSelected ? 'bg-primary bg-opacity-5' : ''}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': labelId }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleClick(row.id);
                            }}
                          />
                        </TableCell>
                      )}

                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align || 'right'}>
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      })}

                      <TableCell align="center">
                        <Tooltip title="ویرایش">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit && onEdit(row);
                            }}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="حذف">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete && onDelete([row.id]);
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell
                    colSpan={selectable ? columns.length + 2 : columns.length + 1}
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="تعداد در هر صفحه:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} از ${count}`
          }
        />
      </Paper>
    </Box>
  );
};

export default DataTable;