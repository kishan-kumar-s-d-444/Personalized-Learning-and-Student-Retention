import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Container } from '@mui/material';

const ProfileCard = styled.div`
    width: 450px;
    height: 250px;
    background-color: #fff;
    background: linear-gradient(#f8f8f8, #fff);
    box-shadow: 0 8px 16px -8px rgba(0,0,0,0.4);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    margin: 1.5rem auto;
`;

const Additional = styled.div`
    position: absolute;
    width: 150px;
    height: 100%;
    background: linear-gradient(#dE685E, #EE786E);
    transition: width 0.4s;
    overflow: hidden;
    z-index: 2;

    ${ProfileCard}:hover & {
        width: 100%;
        border-radius: 0 5px 5px 0;
    }
`;

const UserCard = styled.div`
    width: 150px;
    height: 100%;
    position: relative;
    float: left;

    &::after {
        content: "";
        display: block;
        position: absolute;
        top: 10%;
        right: -2px;
        height: 80%;
        border-left: 2px solid rgba(0,0,0,0.025);
    }
`;

const MoreInfo = styled.div`
    width: 300px;
    float: left;
    position: absolute;
    left: 150px;
    height: 100%;
    color: white;
    padding: 1rem;
`;

const General = styled.div`
    width: 300px;
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    box-sizing: border-box;
    padding: 1rem;
`;

const Stats = styled.div`
    font-size: 2rem;
    display: flex;
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    top: auto;
    color: #fff;
    
    > div {
        flex: 1;
        text-align: center;
    }
`;

const Title = styled.div`
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
`;

const Value = styled.div`
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1.5rem;
`;

const AdminProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Container>
            <ProfileCard>
                <Additional>
                    <UserCard>
                        <div style={{ textAlign: 'center', color: 'white', marginTop: '20px' }}>
                            <h3>ADMIN</h3>
                        </div>
                    </UserCard>
                    <MoreInfo>
                        <h1>{currentUser.name}</h1>
                        <div style={{ margin: '1rem 0' }}>
                            <div>Email: {currentUser.email}</div>
                            <div>Role: Administrator</div>
                        </div>
                        
                    </MoreInfo>
                </Additional>
                <General>
                    <h1>{currentUser.name}</h1>
                    <p>School Administrator with extensive experience in educational management and leadership.</p>
                    <span style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.9em' }}>
                        Mouse over for more info
                    </span>
                </General>
            </ProfileCard>
        </Container>
    );
};

export default AdminProfile;