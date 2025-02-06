import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

const ChooseClass = ({ situation }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error)
    }

    const navigateHandler = (classID) => {
        if (situation === "Teacher") {
            navigate("/Admin/teachers/choosesubject/" + classID)
        }
        else if (situation === "Subject") {
            navigate("/Admin/addsubject/" + classID)
        }
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={styles.loadingText}>Loading Classes...</p>
                </div>
            )
        }

        if (getresponse) {
            return (
                <div style={styles.addClassContainer}>
                    <button 
                        style={styles.addClassButton} 
                        onClick={() => navigate("/Admin/addclass")}
                    >
                        <span style={styles.buttonIcon}>+</span>
                        Create New Class
                    </button>
                </div>
            )
        }

        return (
            <div style={styles.container}>
                <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <div style={styles.headerContainer}>
                    <h2 style={styles.heading}>Select Your Class</h2>
                    <p style={styles.subheading}>
                        Choose a class to proceed with {situation === "Teacher" ? "teacher assignment" : "subject creation"}
                    </p>
                </div>
                <div style={styles.cardList}>
                    {Array.isArray(sclassesList) && sclassesList.length > 0 ? (
                        sclassesList.map((sclass) => (
                            <div 
                                key={sclass._id} 
                                style={styles.card}
                                onClick={() => navigateHandler(sclass._id)}
                            >
                                <div style={styles.cardHeader}>
                                    <div style={styles.classNameContainer}>
                                        <span style={styles.classIcon}>📚</span>
                                        <a href="#!" style={styles.className}>{sclass.sclassName}</a>
                                    </div>
                                    <button style={styles.iconButton}>
                                        <span style={styles.arrowIcon}>→</span>
                                    </button>
                                </div>
                                <div style={styles.cardFooter}>
                                    <div style={styles.cardMeta}>
                                        <span style={styles.metaIcon}>🏫</span>
                                        School Class Details
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <span style={styles.emptyIcon}>🚫</span>
                            <p>No classes available. Create a new class to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return renderContent();
}

export default ChooseClass;

const styles = {
    container: {
        fontFamily: '"Lexend", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f8f9 0%, #e5ebee 100%)',
        padding: '1rem',
    },
    headerContainer: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        maxWidth: '800px',
    },
    heading: {
        color: '#2c3e50',
        fontSize: '2.5rem',
        fontWeight: '800',
        marginBottom: '0.75rem',
        letterSpacing: '-1px',
        background: 'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subheading: {
        color: '#7f8c8d',
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
    },
    loadingSpinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '1rem',
        color: '#2c3e50',
        fontSize: '1.25rem',
    },
    cardList: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem',
        width: '100%',
        maxWidth: '1000px',
        marginTop: '1rem',
    },
    card: {
        flex: '0 1 calc(33.333% - 1rem)', 
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        border: '1px solid transparent',
        minWidth: '250px', 
        maxWidth: '350px', 
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
    },
    classNameContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    classIcon: {
        marginRight: '0.75rem',
        fontSize: '1.5rem',
    },
    className: {
        color: '#2c3e50',
        fontSize: '1.25rem',
        fontWeight: '600',
        textDecoration: 'none',
    },
    iconButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    arrowIcon: {
        fontSize: '1.5rem',
        color: '#3498db',
    },
    cardFooter: {
        borderTop: '1px solid #ecf0f1',
        paddingTop: '1rem',
    },
    cardMeta: {
        display: 'flex',
        alignItems: 'center',
        color: '#7f8c8d',
        fontSize: '0.9rem',
    },
    metaIcon: {
        marginRight: '0.5rem',
        fontSize: '1.25rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '15px',
    },
    emptyIcon: {
        fontSize: '3rem',
        display: 'block',
        marginBottom: '1rem',
    },
    addClassContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '2rem',
    },
    addClassButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    buttonIcon: {
        marginRight: '0.5rem',
        fontSize: '1.25rem',
    },
};