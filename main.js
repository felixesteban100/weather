import "/style.css"
import { getWeather } from "./weather"
import { ICON_MAP } from "./iconMap"
import axios from "axios"

navigator.geolocation.getCurrentPosition(positionSuccess, positionError)

function positionSuccess({ coords }) {
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

function positionError() {
  alert("There was an error getting your location. Please allow us to use your location and refresh the page")
}

const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

function renderWeather({ current, daily, hourly }) {
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)

  document.body.classList.remove("blurred")
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector("[data-current-icon]")

let currentWeatherGlobal
function renderCurrentWeather(current) {
  currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)

  currentWeatherGlobal = ICON_MAP.get(current.iconCode)
}

const DAY_FORMATTER = Intl.DateTimeFormat(undefined, { weekday: "long" })
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily) {
  dailySection.innerHTML = ""
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true)
    setValue("temp", day.maxTemp, { parent: element })
    setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
    dailySection.append(element)
  })
}

const HOUR_FORMATTER = Intl.DateTimeFormat(undefined, { hour: "numeric" })
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
function renderHourlyWeather(hourly) {
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

  changeBackground(currentWeatherGlobal)
}


//https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY

async function getUserLocation(lat, lon) {
  const api_key = '0f89509622aa42239bbf3a52a86c85a1'

  let where = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${api_key}`)
    .then(data => {
      return data.data.results[0].formatted
    })

  document.querySelector("[data-location]").innerHTML = `${where}`
}

function getUserTime() {
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
  let t = setTimeout(function () { getUserTime() }, 1000);
}

function getUserDate() {
  const dayNumber = new Date().getDate()
  const day = new Date().toLocaleString('default', { weekday: 'long' })
  const month = new Date().toLocaleString('default', { month: 'long' })
  const year = new Date().getFullYear()
  document.querySelector("[data-date]").innerHTML = `${day}, ${month} ${dayNumber}, ${year}`
}


function changeBackground(weatherCode) {
  let chosenBackground = ''
  const hour = new Date().getHours()
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const date = new Date()
  const month = monthNames[date.getMonth()]
  let currentDayBySeason
  let bg_firstRow
  let bg_secondRow
  let labelColor
  let dayCardDateColor
  let dayCardBorderColor
  let headerLeftBorderColor

  switch (month) {
    case "March":
    case "April":
    case "May":
      const springDay = hour > 7 && hour < 19
      currentDayBySeason = springDay
      break;

    case "June":
    case "July":
    case "August":
      const summerDay = hour > 7 && hour < 21
      currentDayBySeason = summerDay
      break;

    case "September":
    case "October":
    case "November":
      const fallDay = hour > 7 && hour < 17
      currentDayBySeason = fallDay
      break;

    case "December":
    case "January":
    case "February":
      const winterDay = hour > 7 && hour < 16
      currentDayBySeason = winterDay
      break;

    default:
      break;
  }

  switch (weatherCode) {
    case "sun":
      if (currentDayBySeason === true) {
        chosenBackground = "https://media.istockphoto.com/id/1007768414/photo/blue-sky-with-bright-sun-and-clouds.jpg?s=612x612&w=0&k=20&c=MGd2-v42lNF7Ie6TtsYoKnohdCfOPFSPQt5XOz4uOy4="
        // chosenBackground = "https://images.pexels.com/photos/301599/pexels-photo-301599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        // chosenBackground = "linear-gradient(0.25turn, hsl(58, 47%, 43%), hsl(31, 100%, 50%), hsl(52, 100%, 50%))"
        bg_firstRow = "hsl(243, 100%, 68%)"
        bg_secondRow = "hsl(220, 96%, 32%)"
        labelColor = "hsl(62, 100%, 89%)"
        dayCardDateColor = "hsl(62, 100%, 89%)"
        dayCardBorderColor = "hsl(62, 100%, 89%)" 
        headerLeftBorderColor = "hsl(62, 100%, 89%)"

      } else if (currentDayBySeason === false) {
        chosenBackground = "https://images.pexels.com/photos/1341279/pexels-photo-1341279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        bg_firstRow = "hsl(0, 0%, 0%)"
        bg_secondRow = "hsl(60, 2%, 16%)"
        labelColor = "hsl(182, 100%, 41%)"
        dayCardDateColor = "hsl(182, 100%, 41%)"
        dayCardBorderColor = "hsl(182, 100%, 41%)" 
        headerLeftBorderColor = "hsl(182, 100%, 41%)"
      }
      break;

    case "cloud-sun":
      if (currentDayBySeason === true) {
        chosenBackground = "https://images.pexels.com/photos/417045/pexels-photo-417045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        // chosenBackground = "linear-gradient(0.25turn, hsl(180, 47%, 43%), hsl(208, 100%, 50%), hsl(52, 100%, 50%))"
        bg_firstRow = "hsl(195, 63%, 24%)"
        bg_secondRow = "hsl(227, 53%, 21%)"
        labelColor = "hsl(65, 84%, 69%)"
        dayCardDateColor = "hsl(65, 84%, 69%)"
        dayCardBorderColor = "hsl(65, 84%, 69%)"
        headerLeftBorderColor = "hsl(65, 84%, 69%)"
      } else if (currentDayBySeason === false) {
        chosenBackground = "https://images.pexels.com/photos/416920/pexels-photo-416920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        bg_firstRow = "hsl(243, 91%, 8%)"
        bg_secondRow = "hsl(238, 56%, 13%)"
        labelColor = "hsl(60, 66%, 80%)"
        dayCardDateColor = "hsl(60, 66%, 80%)"
        dayCardBorderColor = "hsl(60, 66%, 80%)" 
        headerLeftBorderColor = "hsl(60, 66%, 80%)" 
      }
      break;

    case "cloud":
      if (currentDayBySeason === true) {
        chosenBackground = "https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        // chosenBackground = "linear-gradient(0.25turn, hsl(243, 89%, 22%), hsl(243, 39%, 51%))"
        bg_firstRow = "hsl(0, 0%, 41%)"
        bg_secondRow = "hsl(0, 0%, 48%)"
        labelColor = "hsl(226, 67%, 80%)"
        dayCardDateColor = "hsl(226, 67%, 80%)"
        dayCardBorderColor = "hsl(226, 67%, 80%)"
        headerLeftBorderColor = "hsl(226, 67%, 80%)"
      } else if (currentDayBySeason === false) {
        chosenBackground = "https://images.pexels.com/photos/416920/pexels-photo-416920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        bg_firstRow = "hsl(229, 41%, 10%)"
        bg_secondRow = "hsl(252, 40%, 16%)"
        labelColor = "hsl(226, 67%, 80%)"
        dayCardDateColor = "hsl(226, 67%, 80%)"
        dayCardBorderColor = "hsl(226, 67%, 80%)"
        headerLeftBorderColor = "hsl(226, 67%, 80%)"
      }
      break;

    case "smog":
      chosenBackground = "https://images.pexels.com/photos/1065925/pexels-photo-1065925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(60, 2%, 28%), hsl(31, 65%, 32%), hsl(52, 74%, 10%))"
      bg_firstRow = "hsl(203, 27%, 23%)"
      bg_secondRow = "hsl(197, 18%, 31%)"
      labelColor = "hsl(195, 41%, 79%)"
      dayCardDateColor = "hsl(195, 41%, 79%)"
      dayCardBorderColor = "hsl(195, 41%, 79%)"
      headerLeftBorderColor = "hsl(195, 41%, 79%)"
      break;

    case "cloud-showers-heavy":
      chosenBackground = "https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(60, 2%, 28%), hsl(33, 8%, 23%), hsl(205, 58%, 11%))"
      bg_firstRow = "hsl(204, 65%, 17%)"
      bg_secondRow = "hsl(197, 73%, 25%)"
      labelColor = "hsl(195, 41%, 79%)"
      dayCardDateColor = "hsl(195, 41%, 79%)"
      dayCardBorderColor = "hsl(195, 41%, 79%)"
      headerLeftBorderColor = "hsl(195, 41%, 79%)"
      break;

    case "snowflake":
      chosenBackground = "https://images.pexels.com/photos/3462588/pexels-photo-3462588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(0, 0%, 42%), hsl(0, 0%, 41%), hsl(0, 0%, 49%))"
      bg_firstRow = "hsl(0, 0%, 49%)"
      bg_secondRow = "hsl(180, 0%, 39%)"
      labelColor = "hsl(0, 0%, 98%)"
      dayCardDateColor = "hsl(0, 0%, 98%)"
      dayCardBorderColor = "hsl(0, 0%, 98%)"
      headerLeftBorderColor = "hsl(0, 0%, 98%)"
      break;

    case "cloud-bolt":
      chosenBackground = "https://images.pexels.com/photos/12330633/pexels-photo-12330633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      // chosenBackground = "linear-gradient(0.25turn, hsl(73, 16%, 11%), hsl(0, 5%, 12%), hsl(62, 42%, 15%))"
      bg_firstRow = "hsl(248, 65%, 11%)"
      bg_secondRow = "rgb(8, 2, 33)"
      labelColor = "hsl(50, 87%, 73%)"
      dayCardDateColor = "hsl(50, 87%, 73%)"
      dayCardBorderColor = "hsl(50, 87%, 73%)"
      headerLeftBorderColor = "hsl(50, 87%, 73%)"
      break;

    default:
      break;
  }
   
  if (chosenBackground !== '') {
    document.body.style.background = `url(${chosenBackground})`;
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundPosition = "center center"
    document.body.style.backgroundAttachment = "fixed"
    document.body.style.backgroundRepeat = "no-repeat"
  }

  const hour_rows = document.querySelectorAll('.hour-row')
  hour_rows.forEach((current, index) => {
    if (index % 2 === 0) {
      current.style.backgroundColor = bg_firstRow
    }

    if (index % 2 !== 0) {
      current.style.backgroundColor = bg_secondRow
    }
  })

  const label = document.querySelectorAll('.label')
  label.forEach((current) => {
    current.style.color = labelColor
  })

  const dayCardDate = document.querySelectorAll('.day-card-date')
  dayCardDate.forEach((current) => {
    current.style.color = dayCardDateColor
  })

  const dayCard = document.querySelectorAll('.day-card')
  dayCard.forEach((current) => {
    current.style.borderColor = dayCardBorderColor
  })

  document.querySelector('.header-left').style.borderColor = headerLeftBorderColor
}
