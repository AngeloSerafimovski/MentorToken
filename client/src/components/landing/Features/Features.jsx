import "./Features.css";
import logo1 from "../../../assets/Icons/feature-card1.svg";
import logo2 from "../../../assets/Icons/feature-card2.svg";
import logo3 from "../../../assets/Icons/feature-card3.svg";
import logo4 from "../../../assets/Icons/feature-card4.svg";
import rocket from "../../../assets/Images/rocket.svg";
import dashboardimg from "../../../assets/Images/mentors.svg"

function Features(){
    return(
        <section className="features">

            <img
        src={rocket}
        alt="Rocket"
        className="rocket-image"
    />
    
            <div className="features-header">
                <h3>Features</h3>

                <h1>
                    Boost your Startup's Journey:
                    Discover Mentor Token's Robust
                    Features
                </h1>
            </div>



            <div className="features-grid">
                <div className="feature-card">
                <div className="feature-icon">
                    <span>
                <img src={logo1} alt="Rocket" />
                    </span>
                </div>
                <div className="featurecard-content">
                    <h3>Goal Setting</h3>
                <p>
                    Set clear and achievable goals for your
                    startup's success
                </p>
                </div>
                </div>

                <div className="feature-card">
                <div className="feature-icon">
                    <span>
                <img src={logo2} alt="Mail" />
                    </span>
                </div>
                <div className="featurecard-content">
                    <h3>Performance Tracking</h3>
                <p>
                   Monitor and mentor performance in 
                   real-time and track progress
                </p>
                </div>
                </div>

                <div className="feature-card">
                <div className="feature-icon">
                    <span>
                <img src={logo3} alt="Reward" />
                    </span>
                </div>
                <div className="featurecard-content">
                    <h3>Reward System</h3>
                <p>
                    Motivate mentors with a secure
                    and rewarding token-based
                    reward system
                </p>
                </div>
                </div>

                <div className="feature-card">
                <div className="feature-icon">
                    <span>
                <img src={logo4} alt="Knowledge" />
                    </span>
                </div>
                <div className="featurecard-content">
                    <h3>Knowledge Library</h3>
                <p>
                    Access a comprehensive Knowledge
                    library to equip mentors with the skills
                    ,and motivation
                </p>
                </div>
                </div>
            </div>



            <div className="bottom-feature">
                <div className="bottom-feature-text">
                    <h1>Every <span>success</span> is rewarded!</h1>
                </div>

                <div className="mentors-image">
                    <img 
                     src={dashboardimg}
                     alt="Dashboard / Mentors image" 
                     />
                </div>
            </div>
        </section>
    )
}

export default Features;