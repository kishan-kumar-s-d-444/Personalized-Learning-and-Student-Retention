import React, { useState } from 'react'
import { 
  StyledTableCell, 
  StyledTableRow, 
  TableContainer as StyledTableContainer,
  TablePaginationStyled 
} from './styles';
import { 
  Table, 
  TableBody, 
  TableContainer, 
  TableHead, 
  Paper,
  Box,
  Typography
} from '@mui/material';

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Check if rows are empty
    const isEmptyRows = rows.length === 0;

    return (
      <StyledTableContainer>
        <TableContainer 
          component={Paper} 
          elevation={3} 
          sx={{ 
            width: '100%', 
            overflowX: 'auto',
            maxHeight: '500px',
            '& table': {
              minWidth: 650
            }
          }}
        >
          <Table stickyHeader aria-label="enhanced table">
            <TableHead>
              <StyledTableRow>
                {columns.map((column) => (
                  <StyledTableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ 
                      minWidth: column.minWidth,
                      background: '#2196F3',
                      color: 'white',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  >
                    {column.label}
                  </StyledTableCell>
                ))}
                <StyledTableCell 
                  align="center"
                  style={{ 
                    background: '#2196F3',
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  Actions
                </StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {isEmptyRows ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={columns.length + 1} align="center">
                    <Box 
                      display="flex" 
                      flexDirection="column" 
                      alignItems="center" 
                      justifyContent="center" 
                      p={4}
                    >
                      <Typography variant="h6" color="textSecondary">
                        No data available
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        There are no records to display
                      </Typography>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <StyledTableRow 
                      key={row.id || index} 
                      role="checkbox" 
                      tabIndex={-1}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <StyledTableCell 
                            key={column.id} 
                            align={column.align || 'left'}
                          >
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value || 'N/A'}
                          </StyledTableCell>
                        );
                      })}
                      <StyledTableCell align="center">
                        <ButtonHaver row={row} />
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePaginationStyled
          rowsPerPageOptions={[5, 10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Rows per page"
        />
      </StyledTableContainer>
    )
}

export default TableTemplate;