const {Builder, By, Key, until} = require('selenium-webdriver')
const delay = ms =>
  new Promise(resolve =>
    setTimeout(() => resolve(), ms))

const padding = 2000
const smallPadding = 500
/*
  You need the chrome driver on your PATH
    http://chromedriver.storage.googleapis.com/index.html
*/
;(async () => {
  let driver = await new Builder().forBrowser('chrome').build()
  try {
    await driver.get('https://www.gooten.com/Admin/Account/Login?ReturnUrl=%2fAdmin%2f#/')
    console.log('waiting 5 minutes for you to login')
    await driver.wait(until.titleIs('Orders | Gooten'), 300000)
    await delay(padding)

    console.log('going to product hub')
    await driver.get('https://www.gooten.com/admin#/hub/all')

    console.log('waiting for product hub to load')
    await driver.wait(until.titleIs('Product Hub | Gooten'), 60000)
    await delay(padding)

    console.log('clicking add new product button')
    await driver.findElement(By.css(".large-only > .jsx-2289864036")).click()
    await delay(padding)

    console.log('waiting one minute for the Product Catalog page to load')
    await driver.wait(until.elementLocated(By.css('.catalog-title')), 60000)
    await delay(padding)

    console.log(`typing 'pillow' into search bar`)
    await driver.findElement(By.css(".input")).sendKeys("pillow")
    await delay(padding)

    console.log('waiting up to 30 seconds for pillow product to appear')
    await driver.wait(until.elementLocated(By.css('.jsx-4014225740:nth-child(1) > .jsx-319438690 > .jsx-319438690:nth-child(1) > .jsx-319438690 > .jsx-319438690')), 30000)
    await delay(padding)

    console.log('selecting pillow product')
    await driver.findElement(By.css(".jsx-4014225740:nth-child(1) > .jsx-319438690 > .jsx-319438690:nth-child(1) > .jsx-319438690 > .jsx-319438690")).click()

    console.log('waiting for page to load')
    await driver.wait(until.elementLocated(By.className(".row:nth-child(2) .jsx-2289864036:nth-child(2) > .jsx-2289864036")), 30000)
    await delay(padding)

    console.log('selecting variants')
    // not sure what this one is yet
    //await driver.findElement(By.css(".row:nth-child(2) > .option-values > .jsx-2289864036:nth-child(1) > .jsx-2289864036")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".row:nth-child(2) .jsx-2289864036:nth-child(2) > .jsx-2289864036")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".jsx-3422451326:nth-child(6) > .indicator")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".option-values > .button-default:nth-child(1) > .jsx-2289864036")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".button-default:nth-child(2) > .jsx-2289864036")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".row:nth-child(4) .jsx-2289864036:nth-child(3) > .jsx-2289864036")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".button-default:nth-child(4)")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".button-default:nth-child(5) > .jsx-2289864036")).click()
    await delay(smallPadding)
    await driver.findElement(By.css(".jsx-2289864036:nth-child(6) > .jsx-2289864036")).click()
    await delay(smallPadding)

    // generic wait here
    console.log('waiting 5 seconds to let page catch up just in case')
    await delay(5000)

    console.log('continuing to the next page(I forget what it is)')
    await driver.findElement(By.css(".jsx-2289864036 > span > span")).click()

    console.log('waiting up to 30 seconds for the page to load')
    await driver.wait(until.elementLocated(By.css(".bulk-upload > .jsx-2289864036")), 30000)

    console.log('clicking on the bulk upload button')
    await driver.findElement(By.css(".bulk-upload > .jsx-2289864036")).click()

    console.log('waiting up to 30 seconds for the modal to appear')
    await driver.wait(until.elementLocated(By.css(".upload-new-artwork")), 30000)

    console.log('clicking upload new artwork button')
    await driver.findElement(By.css(".upload-new-artwork")).click()

    console.log('waiting up to 5 minutes for you to drag and drop new artwork')
    await driver.wait(until.elementLocated(By.css(".upload-new-artwork")), 300000)

    console.log('waiting 10 seconds for picture to render for some reason')
    await delay(10000)

    console.log('Selecting uploaded picture')
    await driver.findElement(By.css(".image-item:nth-child(1) > .jsx-2289864036 > .jsx-2289864036")).click()

    console.log('selecting back')
    await driver.findElement(By.css(".ixjBXu > .image-placeholder")).click()

    console.log('Selecting uploaded picture')
    await driver.findElement(By.css(".image-item:nth-child(1) > .jsx-2289864036 > .jsx-2289864036")).click()

    console.log('clicking apply changes button')
    await driver.findElement(By.css(".apply-changes > .jsx-2289864036")).click()

    console.log('waiting up to 1 minute for apply process to complete')
    await driver.wait(until.elementIsEnabled(By.css(".continue-button")), 60000)

    console.log('clicking continue button')
    await driver.findElement(By.css(".continue-button")).click()

    console.log(`waiting up to 30 seconds for product mockup page to load`)
    // waiting on back button since continue button is the same as previous page
    await driver.wait(until.elementLocated(By.css(".back > .jsx-2289864036")), 30000)

    console.log('clicking continue button')
    await driver.findElement(By.css(".button-cta:nth-child(2) > .jsx-2289864036")).click()

    console.log('waiting for page to load')
    await driver.wait(until.elementLocated(By.css(".publish-to-stores")), 30000)

    console.log('updating title')
    await driver.findElement(By.id("Product Name")).sendKeys("Put title here")

    console.log('dying in 30 seconds')
    await delay(30000)
  } finally {
    await driver.quit()
  }


  driver.quit()
  try {
    await driver.get('http://www.google.com/ncr');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    await driver.quit();
  }
})()
