let currentDate = new Date();
let selectedDate = new Date();
let startHour = null;
let endHour = null;

let selectedCourts = [];

let occupiedSlots = [];

// Apps Script Web App URL
const webAppUrl = "https://script.google.com/macros/s/AKfycbzGreoLN4DfcMPG_8E05DetWeJp29gthoblv9LFSysiCATD-SQHimYAYGLVQCB4nhcwzg/exec";


function sortCourts(courts) {

  const order = {
    "Court 1": 1,
    "Court 2": 2,
    "Court 3": 3
  };

  return [...courts].sort((a, b) => order[a] - order[b]);

}


function findOccupiedSlot(court, hour) {

  const targetHour = hour % 24;

  const found = occupiedSlots.find(slot =>
    slot.court === court &&
    Number(slot.hour) === targetHour
  );

  if (found) {

    console.log(
      "MATCH",
      court,
      targetHour,
      found
    );

  }

  return found;

}


function renderCalendar(){

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("monthYear").innerText =
    currentDate.toLocaleString('default',{
      month:'long',
      year:'numeric'
    });

  const calendarDays =
    document.getElementById("calendarDays");

  calendarDays.innerHTML = "";

  const firstDay =
    new Date(year,month,1).getDay();

  const daysInMonth =
    new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++){

    const blank = document.createElement("div");

    calendarDays.appendChild(blank);

  }

  for(let day=1;day<=daysInMonth;day++){

    const div = document.createElement("div");

    div.classList.add("day");

    div.innerText = day;

    const today = new Date();

    if(
      day===today.getDate()
      &&
      month===today.getMonth()
      &&
      year===today.getFullYear()
    ){
      div.classList.add("today");
    }

    // Highlight currently selected date
    if (
      selectedDate &&
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    ) {
      div.classList.add("selected-day");
    }

    div.onclick = function(){

      document.querySelectorAll(".day")
        .forEach(d=>d.classList.remove("selected-day"));

      div.classList.add("selected-day");

      clearSelection();
      
      // STORE SELECTED DATE
      selectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );

      document.getElementById("bookingWarning").innerText = "";

      loadOccupiedSlots();
      updateSelectedDisplay();
      
    };

    calendarDays.appendChild(div);

  }

}



function updateSelectedDisplay(){

  const courtEl =
    document.getElementById("selectedCourt");

  const timeEl =
    document.getElementById("selectedTime");

  const dateEl =
    document.getElementById("selectedDate");

  if(!dateEl) return;

  if(selectedDate){
    const formatted =
      selectedDate.toLocaleDateString('en-US',{
        weekday:'short',
        year:'numeric',
        month:'short',
        day:'numeric'
      });

    dateEl.innerText = "Date: " + formatted;
  }

}



function getSelectedHours(){

  if(startHour === null){
    return [];
  }

  if(endHour === null){
    return [startHour];
  }

  const minHour =
    Math.min(startHour, endHour);

  const maxHour =
    Math.max(startHour, endHour);

  let hours = [];

  for(let h = minHour; h <= maxHour; h++){

    hours.push(h);

  }

  return hours;

}




function areConsecutive(hours){

  if(hours.length <= 1){
    return true;
  }

  const sorted =
    [...hours].sort((a,b)=>a-b);

  for(let i=1; i<sorted.length; i++){

    if(sorted[i] !== sorted[i-1] + 1){
      return false;
    }

  }

  return true;

}




function repaintGrid(){

  document
    .querySelectorAll(".slot")
    .forEach(cell=>{

      const hour =
        parseInt(cell.dataset.hour);

      const court =
        cell.dataset.court;

      if(
        getSelectedHours().includes(hour)
        &&
        selectedCourts.includes(court)
      ){

        cell.classList.add("selected");

      }
      else{

        cell.classList.remove("selected");

      }

    });

}



function clearSelection(){

  startHour = null;
  endHour = null;

  selectedCourts = [];

  document.getElementById("bookingWarning").innerText = "";
  repaintGrid();
  updateSummary();

}



function updateSummary(){

  if(
    getSelectedHours().length===0
  ){

    if(selectedDate){

      updateSelectedDisplay();
    
    }
    else{
    
      document.getElementById("selectedDate").innerText = "Date:";
    
    }

    document.getElementById("selectedCourt").innerText = "Court:";

    document.getElementById("selectedTime").innerText = "Time:";

    document.getElementById("selectedDuration").innerText = "Duration:";

    return;

  }


  const sortedHours = getSelectedHours();

  const firstHour =
    Math.min(startHour, endHour ?? startHour);
  
  const finalHour =
    Math.max(startHour, endHour ?? startHour) + 1;

  document
    .getElementById(
      "selectedCourt"
    )
    .innerText =
    "Court: "
    +
    sortCourts(selectedCourts).join(", ");

  document
    .getElementById(
      "selectedTime"
    )
    .innerText =
    "Time: "
    +
    (hourToText(firstHour))
    +
    " - "
    +
    (hourToText(finalHour))

  const duration =
  finalHour - firstHour;

document
  .getElementById(
    "selectedDuration"
  )
  .innerText =
  "Duration: "
  +
  duration
  +
  (
    duration === 1
      ? " hour"
      : " hours"
  );

  updateSelectedDisplay();

}



function hourToText(hour){

  hour = hour % 24;

  const h =
    hour % 12 || 12;

  const period =
    hour < 12
      ? "AM"
      : "PM";

  return h + period;

}




function formatHour(hour){

  const start = hour % 12 || 12;
  const startPeriod = hour < 12 ? "AM" : "PM";

  const endHour = (hour + 1) % 24;
  const end = endHour % 12 || 12;
  const endPeriod = endHour < 12 ? "AM" : "PM";

  return `${start}${startPeriod} - ${end}${endPeriod}`;
}


async function loadOccupiedSlots() {

  occupiedSlots = [];

  if (!selectedDate) {

    generateGrid();

    return;

  }

  const yyyy = selectedDate.getFullYear();

  const mm =
    String(selectedDate.getMonth() + 1)
      .padStart(2, "0");

  const dd =
    String(selectedDate.getDate())
      .padStart(2, "0");

  const formattedDate =
    `${yyyy}-${mm}-${dd}`;

  try {

    const response = await fetch(webAppUrl, {
      method: "POST",
      body: JSON.stringify({
        action: "getOccupiedSlots",
        date: formattedDate
      })
    });

    occupiedSlots = await response.json();

    console.log("Occupied slots:", occupiedSlots);

  }
  catch (err) {

    console.error(err);

    occupiedSlots = [];

  }

  generateGrid();

}



function generateGrid(){

  const grid =
    document.getElementById("scheduleGrid");

  grid.innerHTML = "";

  const courts = ["Court 1", "Court 2", "Court 3"];

  for(let hour = 7; hour <= 25; hour++){

    const row =
      document.createElement("div");

    row.classList.add("schedule-row");

    // TIME LABEL
    const time =
      document.createElement("div");

    time.classList.add("time-label");

    time.innerText =
      formatHour(hour);

    row.appendChild(time);

    // COURT CELLS
    courts.forEach(court => {

      const cell =
        document.createElement("div");

      cell.classList.add("slot");

      const occupied = findOccupiedSlot(court, hour);

      if (occupied) {
        console.log(
          "Occupied:",
          court,
          hour,
          occupied.name
        );
      }
      
      if (occupied) {
      
        cell.classList.add("occupied");
        cell.innerText = occupied.name;
      
      }

      cell.dataset.court = court;
      cell.dataset.time = formatHour(hour);
      cell.dataset.hour = hour;

      cell.addEventListener("click", () => {

        if (cell.classList.contains("occupied")) {
          return;
        }

        if (selectedDate === null) {
        
          document.getElementById("bookingWarning").innerText =
            "Please select a date.";
        
          return;
        
        }
      
        const hour =
          parseInt(cell.dataset.hour);
      
        const court =
          cell.dataset.court;
      
      
        // FIRST COURT
        if(selectedCourts.length === 0){
      
          selectedCourts.push(court);
      
        }


        // REMOVE COURT
        if(selectedCourts.includes(court) && selectedCourts.length > 1){
        
          selectedCourts = selectedCourts.filter(c => c !== court);
        
          document.getElementById("bookingWarning").innerText = "";
          repaintGrid();
          updateSummary();
        
          return;
        
        }
    
      
        // SAME COURT
        if(selectedCourts.includes(court)){
        
          // FIRST CLICK
          if(startHour === null){
        
            startHour = hour;
            endHour = null;
        
          }
        
          // SINGLE SLOT RECLICK → CLEAR
          else if(endHour === null && startHour === hour){
        
            clearSelection();
        
          }
        
          // SECOND CLICK → CREATE RANGE
          else if(endHour === null){
        
            endHour = hour;
        
          }
        
          // RANGE ALREADY EXISTS
          else if(endHour !== null){
          
            const rangeStart = Math.min(startHour, endHour);
          
            const rangeEnd = Math.max(startHour, endHour);
          
          
            // User clicked actual END of range
            if(hour === rangeEnd){
          
              // only two slots left
              if(rangeEnd - rangeStart === 1){
          
                startHour = rangeStart;
                endHour = null;
          
              }
              else{
          
                // preserve original direction
                if(startHour > endHour){
          
                  startHour--;
          
                }
                else{
          
                  endHour--;
          
                }
          
              }
          
            }
          
          
            // User clicked actual START of range
            else if(hour === rangeStart){
          
              clearSelection();
          
            }
          
          
            // User clicked somewhere inside the range
            else{
          
              startHour = hour;
              endHour = null;
          
              selectedCourts = [court];
          
            }
          
          }
        
          // START NEW RANGE
          else{
        
            startHour = hour;
            endHour = null;
        
            selectedCourts = [court];
        
          }
        
        }
      
      
        // ADD OR REMOVE COURT
        else{
        
          selectedCourts.push(court);
        
        }
      
        document.getElementById("bookingWarning").innerText = "";
        repaintGrid();
        updateSummary();
      
      });

      row.appendChild(cell);

    });

    grid.appendChild(row);
  }
}


document.getElementById("prevMonth")
.onclick = function(){

  currentDate.setMonth(
    currentDate.getMonth()-1
  );

  renderCalendar();

};

document.getElementById("nextMonth").onclick = function(){

  currentDate.setMonth(currentDate.getMonth()+1);

  renderCalendar();

};

renderCalendar();

if (
  window.location.search &&
  new URLSearchParams(window.location.search).has("date")
) {

  // Returning from test.html
  loadSelectionFromURL();

} else {

  // First page load → use today's date
  updateSelectedDisplay();
  loadOccupiedSlots();

}


document
  .getElementById(
    "bookNowBtn"
  )
  .addEventListener(
    "click",
    function(){

      document.getElementById(
        "bookingWarning"
      ).innerText = "";

      if(selectedDate === null){

        document.getElementById(
          "bookingWarning"
        ).innerText =
          "Please select a date.";

        return;

      }

      if(
        getSelectedHours().length === 0
      ){

        document.getElementById(
          "bookingWarning"
        ).innerText =
          "Please select a time slot.";

        return;

      }

      if(
        selectedCourts.length === 0
      ){

        document.getElementById(
          "bookingWarning"
        ).innerText =
          "Please select a court.";

        return;

      }

      // everything valid
      document.getElementById(
        "bookingWarning"
      ).innerText = "";

      // Build court text
      const sortedCourts = sortCourts(selectedCourts);
      
      let courtText = "";
      
      if (sortedCourts.length === 1) {
      
        courtText = sortedCourts[0];
      
      }
      else if (sortedCourts.length === 2) {
      
        courtText =
          sortedCourts[0]
          + " and "
          + sortedCourts[1];
      
      }
      else {
      
        courtText =
          "Court 1, Court 2, and Court 3";
      
      }
      
      
      // YYYY-MM-DD
      const yyyy =
        selectedDate.getFullYear();
      
      const mm =
        String(selectedDate.getMonth()+1)
          .padStart(2,"0");
      
      const dd =
        String(selectedDate.getDate())
          .padStart(2,"0");
      
      const formattedDate =
        `${yyyy}-${mm}-${dd}`;
      
      
      // duration
      const duration =
        Math.max(startHour, endHour ?? startHour)
        -
        Math.min(startHour, endHour ?? startHour)
        +
        1;
      
      
      // start hour
      const firstHour =
        Math.min(startHour, endHour ?? startHour);
      
      
      // redirect
      window.location.href =
        "https://thepicklerscampcebu-source.github.io/picklers-camp-lapu-lapu/test.html"
        +
        "?date="
        + encodeURIComponent(formattedDate)
        +
        "&court="
        + encodeURIComponent(courtText)
        +
        "&timeIn="
        + firstHour
        +
        "&duration="
        + duration;

    }
  );


  function loadSelectionFromURL() {
  
    const params = new URLSearchParams(window.location.search);
  
    const date = params.get("date");
    const court = params.get("court");
    const timeIn = params.get("timeIn");
    const duration = params.get("duration");
  
    if (!date || timeIn === null || duration === null) {
      return;
    }
  
    // Restore date
    selectedDate = new Date(date);
  
    // Move calendar to correct month
    currentDate = new Date(selectedDate);
  
    renderCalendar();
    loadOccupiedSlots();
  
    // Highlight selected day
    document.querySelectorAll(".day").forEach(d => {
  
      if (Number(d.innerText) === selectedDate.getDate()) {
  
        d.classList.add("selected-day");
  
      }
  
    });
  
    // Restore hours
    startHour = Number(timeIn);
    endHour = startHour + Number(duration) - 1;
  
    // Restore courts
    selectedCourts = court
      .replace(", and ", ", ")
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);
  
      document.getElementById("bookingWarning").innerText = "";
      repaintGrid();
      updateSummary();
  
  }
