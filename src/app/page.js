"use client"
import P5Canvas from "@/components/P5Canvas";
import classes from './home.module.css';
import React, { useState } from 'react';

import { Pipette, LocateFixed, LibraryBig, BookCheck,MountainSnow, Share2, ChartNoAxesGantt, ArrowDownToLine, Megaphone, } from 'lucide-react';

export default function Home() {

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
   
  <div className={classes.pageContainer} >

      <div className={classes.section}>
          <div className={`${classes.login} `}>SIGN-UP | LOGIN | ABOUT</div>
      </div>

          <div  className={classes.spacer}></div>
    <div className={classes.section}>
          <div className={`${classes.oneTwoOne}`}>
            <div></div>
            <div>
              <div className={`${classes.omenland}`}>OMENLAND</div>
              <P5Canvas />
            </div>
            <div></div>
          </div>
          
     
          
          <div  className={classes.spacer}></div>
          <div  className={classes.spacer}></div>



</div>

    <div  className={classes.sectionDark}>
      <div  className={classes.spacer}></div>
      <div  className={classes.spacer}></div>
      <div className={classes.oneTwoOne}>
        <div></div>
          <div className={classes.subTitle}>History in the making</div>
        <div></div>
      </div>

      <div className={classes.oneTwoOne}>
        <div></div>
          <div className={classes.intro}>
            <p>OMENLAND gives you the tools to go deep into recorded history and find meaning in the chaos. If we wish to live well in the present, and ensure a better future. We must first understand our past. </p>
            
          </div>
        <div></div>
      </div>
<div  className={classes.spacer}></div>
<div  className={classes.spacer}></div>
<div  className={classes.spacer}></div>
  </div>

      <div  className={classes.spacer}></div>


 <div  className={classes.section}>
  <div className={classes.subTitle}>Here's how it works</div>
  <div className={classes.oneTwoThree}>
        
        <div className={classes.iconbox} >
          <BookCheck  size={92}  strokeWidth={1} />
          <div className={classes.iconHeader} >Collect histories</div>
          <div>Choose the histories that interest you. 
            Discoveries, inventions, politics, wars, medicine, food...
            all just a click away.
            </div>
        </div>

        <div className={classes.iconbox} >
          <MountainSnow   size={92}  strokeWidth={1} />
          <div className={classes.iconHeader} >Convert to terrain</div>
          <div>As you add a new hisory, the events are used to generate a terrain.
            This land, terra incognita, is ready for you to explore.
            </div>
        </div>


        <div className={classes.iconbox} >
          <LocateFixed size={92} strokeWidth={1} />
          <div className={classes.iconHeader} >Find interesting events</div>
          <div>Explore the terrain you have created, pulling out events that catch your eye. 
            </div>
        </div>

        <div className={classes.iconbox} >
          <ChartNoAxesGantt  size={92}  strokeWidth={1}  />
          <div className={classes.iconHeader} >Generate a timeline</div>
          <div>
            As you explore the past, events pop out to you. Add these to a timeline.
            </div>
        </div>

        <div className={classes.iconbox} >
          <Share2  size={92}  strokeWidth={1}  />
          <div className={classes.iconHeader} >Graph the connections</div>
          <div>
            Build theories about connections between the events on your timeline.
            You've just made history.
            </div>
        </div>

        <div className={classes.iconbox} >
          <Megaphone  size={92}  strokeWidth={1} />
          <div className={classes.iconHeader} >Share your discoveries</div>
          <div>The fun begins. Share and discuss your theories with others. 
            </div>
        </div>
    </div>
</div>
 <div  className={classes.spacer}></div>
  <div  className={classes.spacer}></div>



<div  className={classes.sectionDark}>
        <div  className={classes.spacer}></div>

  <div className={classes.subTitle}>The past is another country</div>
  <div className={classes.intro}>
    <p>The past need no longer be a strange land. 
        <span className={classes.fontRed}> Now you can go there.</span> </p>
  </div>
  
        <div  className={classes.spacer}></div>
        <div  className={classes.spacer}></div>

  <div className={classes.filmie}>
    <img src='./terrain.png' />
  </div>
<div  className={classes.spacer}></div><div  className={classes.spacer}></div>
  

<div  className={classes.spacer}></div>
</div>

<div  className={classes.section}>
  <div  className={classes.spacer}></div>
  <div  className={classes.spacer}></div>
  <div  className={classes.spacer}></div>
  <div  className={classes.spacer}></div>
</div>
  
    </div>
  );
}
