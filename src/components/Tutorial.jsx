import React, { useState, useEffect } from 'react';
import Joyride, { EVENTS, STATUS } from 'react-joyride';
import { HelpCircle, X } from 'lucide-react';

const Tutorial = () => {
    const [run, setRun] = useState(false);
    const [showButton, setShowButton] = useState(false);

    // Steps Configuration
    const steps = [
        {
            target: '#step-keywords',
            content: 'Select medication keyword here to view latest posts from patients',
            title: 'Step 1',
            disableBeacon: true,
        },
        {
            target: '#step-posts',
            content: 'Review posts from patients about their experience with medication',
            title: 'Step 2',
        },
        {
            target: '#step-detail',
            content: 'Click on a Post to see it in detail',
            title: 'Step 3',
        },
        {
            target: '#step-rules',
            content: 'Setup workflow to analyze medication performance and insights (e.g. \\Read last 50 posts...)',
            title: 'Step 4',
        },
        {
            target: '#step-output',
            content: 'See the result of your analysis and export extracted data',
            title: 'Step 5',
        }
    ];

    useEffect(() => {
        // Check local storage on mount
        const dismissed = localStorage.getItem('dsx_tutorial_dismissed');
        if (!dismissed) {
            setRun(true);
        }
        setShowButton(true);
    }, []);

    const handleJoyrideCallback = (data) => {
        const { status, type } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
        }
    };

    const startTutorial = () => {
        setRun(true);
    };

    return (
        <>
            <Joyride
                steps={steps}
                run={run}
                continuous
                showSkipButton
                showProgress
                disableOverlayClose
                callback={handleJoyrideCallback}
                styles={{
                    options: {
                        arrowColor: '#FFFFFF',
                        backgroundColor: '#FFFFFF',
                        overlayColor: 'rgba(0, 0, 0, 0.4)',
                        primaryColor: '#60A5FA',
                        textColor: '#1a1a1a',
                        zIndex: 10000,
                    }
                }}
                tooltipComponent={Tooltip}
            />

            {showButton && (
                <button
                    className="help-button"
                    onClick={startTutorial}
                    title="Start Tutorial"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#60A5FA', // Match Palette Icon Blue
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 9999,
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <HelpCircle size={24} />
                </button>
            )}
        </>
    );
};

// Custom Tooltip Component
const Tooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
}) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleDontShowChange = (e) => {
        const checked = e.target.checked;
        setDontShowAgain(checked);
        if (checked) {
            localStorage.setItem('dsx_tutorial_dismissed', 'true');
        } else {
            localStorage.removeItem('dsx_tutorial_dismissed');
        }
    };

    return (
        <div
            {...tooltipProps}
            style={{
                backgroundColor: '#FFFFFF', // White background
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '350px',
                color: '#1a1a1a',
                border: '1px solid #60A5FA', // Blue border
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                position: 'relative'
            }}
        >
            {/* Close Button "X" */}
            <button
                {...closeProps}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex'
                }}
            >
                <X size={16} color="#666" />
            </button>

            {/* Title */}
            {step.title && (
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 600 }}>
                    {step.title}
                </h4>
            )}

            {/* Content */}
            <div style={{ marginBottom: '20px', lineColor: 1.5, fontSize: '0.95rem' }}>
                {step.content}
            </div>

            {/* Footer: Toggle & Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                {/* Don't Show Again */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={handleDontShowChange}
                        style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer'
                        }}
                    />
                    Don't show again
                </label>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Back Button (optional, omitted in user image but good for UX) */}
                    {index > 0 && (
                        <button
                            {...backProps}
                            style={{
                                padding: '6px 16px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Back
                        </button>
                    )}

                    {/* Next/Finish Button */}
                    <button
                        {...primaryProps}
                        style={{
                            padding: '6px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#0FB6F0', // Blue
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        {continuous ? 'Next' : 'Finish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Tutorial;
