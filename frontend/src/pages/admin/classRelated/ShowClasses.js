import { useEffect, useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddCardIcon from '@mui/icons-material/AddCard';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const ClassContainer = styled.div`
  width: 1142px;
  margin: 0 auto;
  padding: 32px 0;
`;

const ClassesGrid = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 30px;
  padding: 50px 0;
`;

const ClassCard = styled.div`
  flex-basis: calc(33.33333% - 30px);
  overflow: hidden;
  border-radius: 28px;
  background-color: #ffffff;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media only screen and (max-width: 979px) {
    flex-basis: calc(50% - 30px);
  }

  @media only screen and (max-width: 639px) {
    flex-basis: 100%;
  }
`;

const CardLink = styled.div`
  display: block;
  padding: 30px 20px;
  position: relative;
  overflow: hidden;
`;

const CardBackground = styled.div`
  height: 128px;
  width: 128px;
  background-color: ${props => props.color};
  position: absolute;
  top: -75px;
  right: -75px;
  border-radius: 50%;
  transition: all 0.5s ease;
  z-index: 1;

  ${CardLink}:hover & {
    transform: scale(10);
  }
`;

const CardTitle = styled.div`
  min-height: 87px;
  margin: 0 0 25px;
  font-weight: bold;
  font-size: 30px;
  color: #333;
  position: relative;
  z-index: 2;
  transition: color 0.5s ease;

  ${CardLink}:hover & {
    color: #FFF;
  }

  @media only screen and (max-width: 979px) {
    font-size: 24px;
  }

  @media only screen and (max-width: 639px) {
    min-height: 72px;
    line-height: 1;
    font-size: 24px;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 2;
  transition: color 0.5s ease;

  ${CardLink}:hover & {
    color: #FFF;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  font-size: 16px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;
const SpeedDialContainer = styled.div`
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
`;

const ShowClasses = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);
  const adminID = currentUser._id;

  useEffect(() => {
    dispatch(getAllSclasses(adminID, "Sclass"));
  }, [adminID, dispatch]);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const deleteHandler = (deleteID, address) => {
    dispatch(deleteUser(deleteID, address))
      .then(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
      });
  };

  const actions = [
    {
      icon: <AddCardIcon color="primary" />,
      name: 'Add New Class',
      action: () => navigate("/Admin/addclass"),
    },
    {
      icon: <DeleteIcon color="error" />,
      name: 'Delete All Classes',
      action: () => deleteHandler(adminID, "Sclasses"),
    },
  ];

  const cardColors = ['#f9b234', '#3ecd5e', '#e44002', '#952aff', '#cd3e94', '#4c49ea'];

  return (
    <>
      <h1 style={{ textAlign: "center" }}><b>Classes</b></h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ClassContainer>
          {getresponse ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <GreenButton variant="contained" onClick={() => navigate("/Admin/addclass")}>
                Add Class
              </GreenButton>
            </Box>
          ) : (
            <ClassesGrid>
              {sclassesList?.map((sclass, index) => (
                <ClassCard key={sclass._id}>
                  <CardLink>
                    <CardBackground color={cardColors[index % cardColors.length]} />
                    <CardTitle>{sclass.sclassName}</CardTitle>
                    <CardActions>
                      <ActionButton onClick={() => deleteHandler(sclass._id, "Sclass")}>
                        <DeleteIcon />
                      </ActionButton>
                      <ActionButton onClick={() => navigate(`/Admin/classes/class/${sclass._id}`)}>
                        View
                      </ActionButton>
                      <ActionMenu
                        actions={[
                          {
                            icon: <PostAddIcon />,
                            name: 'Add Subjects',
                            action: () => navigate(`/Admin/addsubject/${sclass._id}`)
                          },
                          {
                            icon: <PersonAddAlt1Icon />,
                            name: 'Add Student',
                            action: () => navigate(`/Admin/class/addstudents/${sclass._id}`)
                          },
                        ]}
                      />
                    </CardActions>
                  </CardLink>
                </ClassCard>
              ))}
            </ClassesGrid>
          )}
          <SpeedDialContainer>
            <SpeedDialTemplate actions={actions} />
          </SpeedDialContainer>
        </ClassContainer>
      )}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

const ActionMenu = ({ actions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title="Add Students & Subjects">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <SpeedDialIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((action) => (
          <MenuItem key={action.name} onClick={action.action}>
            <ListItemIcon>{action.icon}</ListItemIcon>
            {action.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ShowClasses;
