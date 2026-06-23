let currentDate = new Date();
let selectedDate = new Date();
let selectedSlots = []; 
// each item: { court: "Court 1", hour: 14 }

let occupiedSlots = [];

// customer info coming from test.html
let bookingEmail = "";
let bookingConfirmEmail = "";
let bookingName = "";
let bookingContact = "";
let bookingAddress = "";

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

    today.setHours(0,0,0,0);
    
    const thisDate = new Date(year, month, day);
    
    if (thisDate < today) {
    
      div.classList.add("past-slot");
    
    }
    else {
    
      div.onclick = function(){
    
        document.querySelectorAll(".day")
          .forEach(d => d.classList.remove("selected-day"));
    
        div.classList.add("selected-day");
    
        clearSelection();
    
        selectedDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        );
    
        document.getElementById("bookingWarning").innerText = "";
    
        loadOccupiedSlots();
        updateSelectedDisplay();
    
      };
    
    }

    calendarDays.appendChild(div);

  }

}



function updateSelectedDisplay(){

  const dateEl = document.getElementById("selectedDate");

  if(!dateEl) return;

  if(selectedDate){

    const formatted = selectedDate.toLocaleDateString('en-US',
        {
          weekday:'short',
          year:'numeric',
          month:'short',
          day:'numeric'
        }
      );

    dateEl.innerText = "Date: " + formatted;

  }
  else {

    dateEl.innerText = "Date:";

  }

}


function isSlotSelected(court, hour) {
  return selectedSlots.some(s => s.court === court && s.hour === hour);
}


function repaintGrid(){

  document
    .querySelectorAll(".slot")
    .forEach(cell=>{

      const hour =
        parseInt(cell.dataset.hour);

      const court =
        cell.dataset.court;

      if (isSlotSelected(court, hour)) {
        cell.classList.add("selected");
      } else {
        cell.classList.remove("selected");
      }

    });

}



function clearSelection() {
  selectedSlots = [];
  document.getElementById("bookingWarning").innerText = "";
  repaintGrid();
  updateSummary();
}



function updateSummary() {

  updateSelectedDisplay();
  document.getElementById("selectedDuration").innerText = "Number of Slots Selected: " + selectedSlots.length;

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



function isPastSlot(hour) {

  if (!selectedDate) return false;

  const now = new Date();

  const slotStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    hour % 24,
    0,
    0,
    0
  );

  return slotStart < now;

}


function isClosedHour(hour){

  return hour >= 2 && hour < 7;

}


function generateGrid(){

  const grid =
    document.getElementById("scheduleGrid");

  grid.innerHTML = "";

  const courts = ["Court 1", "Court 2", "Court 3"];

  for(let hour = 0; hour <= 23; hour++){

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
      const pastSlot = isPastSlot(hour);
      const closedHour = isClosedHour(hour);

      if (occupied) {
        console.log(
          "Occupied:",
          court,
          hour,
          occupied.name
        );
      }
      
      if (occupied) {
      
        if (occupied.status === "Pending") {
      
          cell.classList.add("pending-slot");
          cell.innerText = occupied.name + " - PENDING";
      
        }
        else {
      
          cell.classList.add("occupied");
          cell.innerText = occupied.name;
      
        }
      
      }
      else if (closedHour) {
      
        cell.classList.add("closed-slot");
        cell.innerText = "CLOSED";
      
      }
      else if (pastSlot) {
      
        cell.classList.add("past-slot");
        cell.innerText = "PAST";
      
      }
      else {
      
        cell.classList.add("available-slot");
        cell.innerText = "AVAILABLE";
      
      }

      cell.dataset.court = court;
      cell.dataset.time = formatHour(hour);
      cell.dataset.hour = hour;

      cell.addEventListener("click", () => {
      
        if (
          cell.classList.contains("occupied") ||
          cell.classList.contains("pending-slot") ||
          cell.classList.contains("past-slot") ||
          cell.classList.contains("closed-slot")
        ) {
          return;
        }
      
        if (!selectedDate) {
          document.getElementById("bookingWarning").innerText =
            "Please select a date.";
          return;
        }
      
        const court = cell.dataset.court;
        const hour = Number(cell.dataset.hour);
      
        const index = selectedSlots.findIndex(s =>
          s.court === court && s.hour === hour
        );
      
        // TOGGLE behavior
        if (index >= 0) {
          selectedSlots.splice(index, 1); // deselect
        } else {
          selectedSlots.push({ court, hour }); // select
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

  loadSelectionFromURL();

} else {

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

      if (selectedSlots.length === 0) {
      
        document.getElementById("bookingWarning").innerText = "Please select a time slot.";
        return;
      
      }

      // everything valid
      document.getElementById("bookingWarning").innerText = "";
      
      
      // YYYY-MM-DD
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth()+1).padStart(2,"0");
      const dd = String(selectedDate.getDate()).padStart(2,"0");
      const formattedDate = `${yyyy}-${mm}-${dd}`;


      const sortedSlots = [...selectedSlots].sort((a, b) => {
      
          const order = {
            "Court 1": 1,
            "Court 2": 2,
            "Court 3": 3
          };
      
          if (order[a.court] !== order[b.court]) {
            return order[a.court] - order[b.court];
          }
      
          return a.hour - b.hour;
      
        });

      
      // redirect
      window.location.href = "https://thepicklerscampcebu-source.github.io/picklers-camp-lapu-lapu/test.html"
        + "?date=" + encodeURIComponent(formattedDate)
        + "&slots=" + encodeURIComponent(JSON.stringify(sortedSlots))
      
        + "&email=" + encodeURIComponent(bookingEmail)
        + "&confirmEmail=" + encodeURIComponent(bookingConfirmEmail)
        + "&name=" + encodeURIComponent(bookingName)
        + "&contact=" + encodeURIComponent(bookingContact)
        + "&address=" + encodeURIComponent(bookingAddress);

    }
  );


  document
    .getElementById("clearBtn")
    .addEventListener("click", clearSelection);


  async function loadSelectionFromURL() {
  
    const params = new URLSearchParams(window.location.search);
  
    const date = params.get("date");
    const slots = JSON.parse(decodeURIComponent(params.get("slots") || "[]"));

    bookingEmail = decodeURIComponent(params.get("email") || "");
    bookingConfirmEmail = decodeURIComponent(params.get("confirmEmail") || "");
    bookingName = decodeURIComponent(params.get("name") || "");
    bookingContact = decodeURIComponent(params.get("contact") || "");
    bookingAddress = decodeURIComponent(params.get("address") || "");
  
    if (!date) {
      return;
    }
  
    // Restore date
    selectedDate = new Date(date);
  
    // Move calendar to correct month
    currentDate = new Date(selectedDate);
  
    renderCalendar();
    
    // Wait until occupied slots are loaded
    await loadOccupiedSlots();
  
    // Highlight selected day
    document.querySelectorAll(".day").forEach(d => {
  
      if (Number(d.innerText) === selectedDate.getDate()) {
  
        d.classList.add("selected-day");
  
      }
  
    });
  
    selectedSlots = slots;
  
    document.getElementById("bookingWarning").innerText = "";
    repaintGrid();
    updateSummary();

    console.log("Restored customer information:", {
      bookingEmail,
      bookingConfirmEmail,
      bookingName,
      bookingContact,
      bookingAddress
    });
  
  }
