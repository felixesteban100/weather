import "/style.css"
import { getWeather } from "./weather"  
import { ICON_MAP } from "./iconMap"
import axios from "axios"

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({coords}){
  getWeather(
    coords.latitude, 
    coords.longitude, 
    currentTimeZone
  )
  .then(renderWeather)
  .catch(error => {
    console.error(error)
    alert("Error getting weather.")
  })  

  getUserLocation(coords.latitude, coords.longitude)
  getUserDate()
  getUserTime()
}

function positionError(){
  alert("There was an error getting your location. Please allow us to use your location and refresh the page")
}

const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

function renderWeather({current, daily, hourly}){
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)

  document.body.classList.remove("blurred")
}

function setValue(selector, value, { parent = document } = {}){
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode){
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")

function renderCurrentWeather(current){
  currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)

  changeBackground(ICON_MAP.get(current.iconCode))
}


const DAY_FORMATTER = Intl.DateTimeFormat(undefined, { weekday: "long"})
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily){
  dailySection.innerHTML = ""
  daily.forEach(day => {
     const element = dayCardTemplate.content.cloneNode(true)
     setValue("temp", day.maxTemp, { parent: element })
     setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
     element.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
     dailySection.append(element)
  })
}


const HOUR_FORMATTER = Intl.DateTimeFormat(undefined, { hour: "numeric"})
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
function renderHourlyWeather(hourly){
  hourlySection.innerHTML = ""

  let day = new Date().getDate()

  hourly.forEach((hour) => {
    day = HOUR_FORMATTER.format(hour.timestamp) === "12 AM" ? day + 1 : day
    day = day >= 32 ? 1 : day
    const element = hourRowTemplate.content.cloneNode(true)
    setValue("temp", hour.temp, { parent: element })
    setValue("fl-temp", hour.feelsLike, { parent: element })
    setValue("wind", hour.windSpeed, { parent: element })
    setValue("precip", hour.precip, { parent: element })
    setValue("day", `${DAY_FORMATTER.format(hour.timestamp)} ${day}`, { parent: element })
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
    hourlySection.append(element)
  })
}


//https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY

async function getUserLocation(lat, lon){
  const api_key = '0f89509622aa42239bbf3a52a86c85a1'

  let where = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${api_key}`)
  .then(data => {
    return data.data.results[0].formatted
  })

  document.querySelector("[data-location]").innerHTML = `${where}` 
}

function getUserTime(){
  let time = new Date();
  let hour = time.getHours();
  let min = time.getMinutes();
  let sec = time.getSeconds();
  let am_pm = " AM";

  if (hour > 12) {
      hour -= 12;
      am_pm = " PM";
  }
  if (hour == 0) {
      hr = 12;
      am_pm = " AM";
  }

  hour = hour < 10 ? "0" + hour : hour;
  min = min < 10 ? "0" + min : min;
  sec = sec < 10 ? "0" + sec : sec;

  let currentTime = hour + ":"
          + min + ":" + sec + am_pm;

  document.querySelector("[data-time]").innerText = `${currentTime}` 
  let t = setTimeout(function(){ getUserTime() }, 1000);
}

function getUserDate(){
  const dayNumber = new Date().getDate()
  const day = new Date().toLocaleString('default', { weekday: 'long' })
  const month = new Date().toLocaleString('default', { month: 'long' })
  const year = new Date().getFullYear()
  document.querySelector("[data-date]").innerHTML = `${day}, ${month} ${dayNumber}, ${year}` 
}

function changeBackground(weatherCode){
  let chosenBackground = ''

  const hour = new Date().getHours()
  const month = new Date().getMonth()

  let currentDayBySeason
  switch(month){
    case 2 || 3 || 4:
      const springDay = hour > 8 && hour < 19
      currentDayBySeason = springDay
    break;

    case 5 || 6 || 7:
      const summerDay = hour > 8 && hour < 21
      currentDayBySeason = summerDay
    break;

    case 8 || 9 || 10:
      const fallDay = hour > 8 && hour < 17
      currentDayBySeason = fallDay
    break;

    case 11 || 0 || 1:
      const winterDay = hour > 8 && hour < 16
      currentDayBySeason = winterDay
    break;

    default:
    break;
  }

  switch(weatherCode){
    case "sun":
      if (currentDayBySeason) {
        chosenBackground = "https://images.pexels.com/photos/301599/pexels-photo-301599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(58, 47%, 43%), hsl(31, 100%, 50%), hsl(52, 100%, 50%))"
      }else{
        chosenBackground = "https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      }
    break;

    case "cloud-sun":
      if (currentDayBySeason) {
        chosenBackground = "https://images.pexels.com/photos/417045/pexels-photo-417045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        // chosenBackground = "linear-gradient(0.25turn, hsl(180, 47%, 43%), hsl(208, 100%, 50%), hsl(52, 100%, 50%))"
      }else{
        chosenBackground = "https://images.pexels.com/photos/416920/pexels-photo-416920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      }
    break;

    case "cloud":
      chosenBackground = "https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(243, 89%, 22%), hsl(243, 39%, 51%))"
    break;

    case "smog":
      chosenBackground = "https://images.pexels.com/photos/1065925/pexels-photo-1065925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(60, 2%, 28%), hsl(31, 65%, 32%), hsl(52, 74%, 10%))"
    break;

    case "cloud-showers-heavy":
      chosenBackground = "https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(60, 2%, 28%), hsl(33, 8%, 23%), hsl(205, 58%, 11%))"
    break;

    case "snowflake":
      chosenBackground = "https://images.pexels.com/photos/3462588/pexels-photo-3462588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(0, 0%, 42%), hsl(0, 0%, 41%), hsl(0, 0%, 49%))"
    break;

    case "cloud-bolt":
      chosenBackground = "https://images.pexels.com/photos/12330633/pexels-photo-12330633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(73, 16%, 11%), hsl(0, 5%, 12%), hsl(62, 42%, 15%))"
    break;

    default:
    break;
  }
  

  document.body.style.background = `url(${chosenBackground})`;
  document.body.style.backgroundSize = "cover"
  document.body.style.backgroundPosition = "center center"
  document.body.style.backgroundAttachment = "fixed"
  document.body.style.backgroundRepeat = "no-repeat"
}