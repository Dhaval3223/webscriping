import express from "express";
import puppeteer from "puppeteer-extra";
import { executablePath } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// 6LcHxwcUAAAAAIUazEuUGlfmc7IyjkUDFXwtd70t

const config = {
  sitekey: "6LcHxwcUAAAAAIUazEuUGlfmc7IyjkUDFXwtd70t",
  pageurl: "https://india.1xbet.com/",
  apikey: "fd97a2654ed7d0d3153011ff3cc6715f",
  apiSubmitUrl: "http://2captcha.com/in.php",
  apiRetrieveUrl: "http://2captcha.com/res.php",
};

const chromeOptions = {
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: false,
  slowMo: 10,
  defaultViewport: null,
};

puppeteer.use(StealthPlugin());
const app = express();
const port = 5000;

const url = "https://india-1xbet.in/";

const botURL = "https://bot.sannysoft.com/";

const username = "800358415";
const password = "9pezfkrf";

// const browser = await puppeteer.launch({
//   headless: true,
//   executablePath: executablePath(),
// });
const browser = await puppeteer.launch(chromeOptions);
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.setDefaultNavigationTimeout(0);

// Navigate the page to a URL
await page.goto(url);

const pageEvaluation = async () =>
  await page.evaluate(() => {
    const data = document.getElementsByClassName(
      "c-events__item c-events__item_game c-events-item"
    );

    return Array.from(data).map((elementA) => ({
      team: elementA.getElementsByClassName("c-events__teams")[0].title.trim(),
      previewLink: elementA
        .getElementsByClassName("c-events__name")[0]
        .href.trim(),
      team1Score: elementA.getElementsByClassName(
        "c-events-scoreboard__cell c-events-scoreboard__cell--all"
      )?.[0]?.innerHTML
        ? elementA.getElementsByClassName(
            "c-events-scoreboard__cell c-events-scoreboard__cell--all"
          )?.[0]?.innerHTML
        : "-",
      team2Score: elementA.getElementsByClassName(
        "c-events-scoreboard__cell c-events-scoreboard__cell--all"
      )?.[1]?.innerHTML
        ? elementA.getElementsByClassName(
            "c-events-scoreboard__cell c-events-scoreboard__cell--all"
          )?.[1]?.innerHTML
        : "-",
      team1wins: elementA
        .querySelector('.c-bets__bet[title="1"]')
        ?.getElementsByClassName("c-bets__inner")
        ? elementA
            .querySelector('.c-bets__bet[title="1"]')
            .getElementsByClassName("c-bets__inner")[0]
            .innerHTML.trim()
        : "-",
      team2wins: elementA
        .querySelector('.c-bets__bet[title="2"]')
        ?.getElementsByClassName("c-bets__inner")
        ? elementA
            .querySelector('.c-bets__bet[title="2"]')
            .getElementsByClassName("c-bets__inner")[0]
            .innerHTML.trim()
        : "-",
      draw: elementA
        .querySelector('.c-bets__bet[title="Draw"]')
        ?.getElementsByClassName("c-bets__inner")
        ? elementA
            .querySelector('.c-bets__bet[title="Draw"]')
            .getElementsByClassName("c-bets__inner")[0]
            .innerHTML.trim()
        : "-",
      team1x: elementA
        .querySelector('.c-bets__bet[title="Team 1 Wins"]')
        ?.getElementsByClassName("c-bets__inner")
        ? elementA
            .querySelector('.c-bets__bet[title="Team 1 Wins"]')
            .getElementsByClassName("c-bets__inner")[0]
            .innerHTML.trim()
        : "-",
      team2x: elementA
        .querySelector('.c-bets__bet[title="Team 2 Wins"]')
        ?.getElementsByClassName("c-bets__inner")
        ? elementA
            .querySelector('.c-bets__bet[title="Team 2 Wins"]')
            .getElementsByClassName("c-bets__inner")[0]
            .innerHTML.trim()
        : "-",
    }));
  });

const signIn = async () => {
  await page.waitForSelector(".loginDropTop");

  // Click the button with the specific class
  await page.click(".loginDropTop");
  await page.type("#auth_id_email", username);
  await page.type("#auth-form-password", password);
  const buttonSelector =
    '.auth-button.auth-button--block.auth-button--slide-up-hover.auth-button--theme-secondary[type="button"]';

  // Wait for the button to be available
  await page.waitForSelector(buttonSelector);

  // Click on the button
  await page.click(buttonSelector);
  await new Promise((resolve) => setTimeout(resolve, 10000));
  await page.screenshot({ path: "bot.jpg" });
};

signIn();

async function navigateAndExtract(url) {
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  await page.goto(url);

  // Here you would add the logic to extract specific data from the page
  // For example, to get the title of the page:
  const result = await page.evaluate(() => {
    const teams = [...document.querySelectorAll(".bet-inner")]
      .map((el) => {
        const type = el.querySelector(".bet_type").textContent.trim();
        const coef = el.querySelector(".koeff__label").textContent.trim();
        return { type, coef };
      })
      .filter((team) => !team.type.toLowerCase().includes("draw")); // Exclude draw option

    let allBetsData = [];

    // Select all bet groups
    const betGroups = document.querySelectorAll(".bet_group");

    betGroups.forEach((group) => {
      const groupName = group
        .querySelector(".bet-title__label")
        .innerText.trim(); // Extract the group name
      const bets = group.querySelectorAll(".bet-inner"); // Find all bets within the group

      let betData = {
        groupName,
        bets: [],
      };

      bets.forEach((bet) => {
        const betType = bet.querySelector(".bet_type").innerText.trim();
        const coefficient = bet.querySelector(".koeff__label").innerText.trim();

        betData.bets.push({
          betType,
          coefficient,
        });
      });

      allBetsData.push(betData);
    });

    // Assuming the first two entries are teams (after excluding draws)
    if (teams.length >= 2) {
      const teamA = teams[0];
      const teamB = teams[1];
      console.log("allBetsData", allBetsData);
      return {
        teamA: `${teamA.type} - ${parseFloat(teamA.coef).toFixed(2)}`,
        teamB: `${teamB.type} - ${parseFloat(teamB.coef).toFixed(2)}`,
        teamAName: teamA.type,
        teamBName: teamB.type,
        teamAScore: parseFloat(teamA.coef),
        teamBScore: parseFloat(teamB.coef),
        allBetsData: allBetsData,
      };
    } else {
      // Handle the case where there might not be two teams
      return { error: "Not enough teams found." };
    }
  });

  console.log(result);

  await browser.close();

  return result;
}

app.get("/scraping", async (req, res) => {
  const data = await pageEvaluation();
  res.send(data);
});

app.get("/extract-data", async (req, res) => {
  const { url } = req.body || {};
  // if (!url) {
  //   return res.status(400).send("URL is required");
  // }

  try {
    // Assuming navigateAndExtract function is modified to return data
    const data = await navigateAndExtract(
      "https://india.1xbet.com/live/cricket/2515557-kuwait-challengers-cup-t20/513047246-mec-study-group-super-strikers-xi"
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).send("Failed to extract data");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
