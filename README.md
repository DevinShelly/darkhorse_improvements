# DarkHorseOdds Improvements
This does a few things at the moment. First, it automatically clicks on the update button when it becomes active so that your odds are always as up to date as possible. Second, if you double click on a bet in one of the bet finder screens, it automatically opens the Browse Odds page and opens the page for that particular market so that you can quickly see which side of the market is off.

In addition, it now devigs automatically while browsing odds. Simply hover your mouse over a line while browsing odds and it will show you what the fair odds are for that market using the power method. 

Once you've identified what you think is a line that might have value, you can also check it for value quickly against the broader market. Simply click the line that you think has value and it will turn solid yellow. The rest of the market will turn either green or red depending on if there is value versus that book's fair value. 

To illustrate, here's a screenshot to a tennis line which is a market outlier on Caeasars. Every other book is in green, quickly confirming that it is a market outlier. If you then hover over each book, it will tell you how +EV Caesars line is vs each book, and you can decide for yourself which books you trust to be sharp.

### Installation
To install, you first need a browser extension that allows you to load custom Javascript. I use Custom Javascript for Chrome, https://chrome.google.com/webstore/detail/custom-javascript-for-web/ddbjnfjiigjmcpcpkmhogomapikjbjdk?hl=en. 

Then go to darkhorseodds.com and click on the CJS icon at the top. Then click the "Inject your own external scripts" button and paste in the following, including the slashes: `//cdn.statically.io/gh/DevinShelly/darkhorse_improvements/main/improvements.min.js`

### Customization
To customize the Kelly criterion values for your individual bankroll, then copy and paste the following variables into the empty Custom Javascript page while browsing DarkHorseOdds. Then the tooltip that pops up when you've identified a soft line will match those values.
```
bankroll = 100000;
kelly_fraction = 0.25;
```

Finally, for one-sided markets, the market juice has to be estimated. By default, it's set to 10%, but you can change that to however you want by pasting the following variable.

```
one_way_overround = 1.1;
```
