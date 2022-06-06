const playwright = require("playwright");
const tempmail = require("tempmail.lol");
const fs = require("node:fs");

// USAGE: node . [headless: false | true]

(async () => {
    await generateAccount();
})();


async function generateAccount() {
    var run_headless = false;
    let headless_inp = process.argv[2];
    if (headless_inp == "true") run_headless = true;


    const browser = await playwright["chromium"].launch({
        headless: run_headless
    });
    const context = await browser.newContext();
    context.setDefaultTimeout(0)
    const page = await context.newPage();

    console.log("Browser Created!");


    await page.goto("https://account.jetbrains.com/login/");

    await page.waitForLoadState('domcontentloaded');
    console.log("Page loaded!");



    const emailToken = await genInbox();
    var email = emailToken.address;
    await page.type("input[id=email]", email);
    await page.keyboard.press("Enter", { delay: 2000 });
    
    // Check for captcha
    // var x = page.locator("span[class=recaptcha-checkbox goog-inline-block recaptcha-checkbox-unchecked rc-anchor-checkbox]");
    // if (x != null && x != undefined) { /* console.log("Captcha Found!"); */ }
    

    await page.waitForSelector("div[class=row]");


    console.log("Creating account!");
    do {
        var emails = await getInboxContents(emailToken);
        if (emails == null)
            console.log("Nothing...");
    } while (
        emails == null
        || emails.length <= 0
        || emails == undefined
    )

    var link = await getLink(emails[0]);
    const newPage = await context.newPage();
    newPage.goto(link);


    await newPage.waitForLoadState('domcontentloaded', { delay: 2000 });
    
    console.log("Writing name, password, etc!");
    var firstname = genRandom(10);
    await newPage.type("input[id=firstName]", firstname, { delay: 253 });
    await newPage.type("input[id=lastName]", genRandom(Math.floor(Math.random()*35+1)), { delay: 137 });
    await newPage.type("input[id=userName]", firstname, { delay: 320 });
    var password = genRandom(20);
    await newPage.type("input[id=password]", password, { delay: 169 });
    await newPage.type("input[id=pass2]", password, { delay: 146 });
    await newPage.click("input[name=privacy]", { delay: 129 });
    await newPage.keyboard.press("Enter", { delay: 2000 });
    await newPage.waitForSelector("div[class=js-notification-widget]");

    await browser.close();
    
    fs.appendFileSync("./accounts.txt", `[\"name\": \"${firstname}\", \"email\": \"${email}\", \"password\": \"${password}\"]\n`);

    console.log("\n\n  ACCOUNT GENERATED");
    console.log(" =====================");
    console.log("  USERNAME:  " + firstname);
    console.log("  EMAIL:     " + email);
    console.log("  PASSWORD:  " + password);
    console.log("\n\n");

}


async function genInbox() {
    // https://tempmail.lol/
    const inbox = await tempmail.createInboxAsync();
    console.log(`Created new inbox: ${inbox.address}, token: ${inbox.token}`);
    return inbox;
}

async function getInboxContents(inbox) {
    const emails = await tempmail.checkInboxAsync(inbox.token);
    if (emails.length <= 0) return null;
    return emails;
}

async function getLink(email) {
    var body = email["body"];
    const re = new RegExp("https://account.*signup-complete/.*]");
    var something = re.exec(body)[0];
    var link = something.substring(0, something.length - 2);
    return link;
}

function genRandom(length) {
    var random = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (let i = 1; i <= length; i++) {
        var char = Math.floor(Math.random() * chars.length + 1);
        random += chars.charAt(char);
    }
    return random;
}
