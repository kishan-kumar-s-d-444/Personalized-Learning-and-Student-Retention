import {
    TableCell,
    TableRow,
    styled,
    tableCellClasses,
    Drawer as MuiDrawer,
    AppBar as MuiAppBar,
    TablePagination as MuiTablePagination
} from "@mui/material";

const drawerWidth = 240

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#2196F3',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '2px solid #1976d2',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        fontWeight: 500,
        color: theme.palette.text.primary,
        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
        backgroundColor: 'rgba(33, 150, 243, 0.05)',
        transition: 'background-color 0.2s ease',
    },
    '& > *': {
        transition: 'none',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export const TableContainer = styled('div')(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    background: 'white',
    border: '1px solid rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 8px 15px rgba(0,0,0,0.15)',
    },
}));

export const TablePaginationStyled = styled(MuiTablePagination)(({ theme }) => ({
    '& .MuiTablePagination-toolbar': {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    },
    '& .MuiTablePagination-actions button': {
        color: theme.palette.primary.main,
    },
}));

export const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);