params = function()
{
  return new URLSearchParams(window.location.search);
}

load_league = function()
{
  league_list = document.querySelector("app-browse-odd-league-list");
  if (!league_list)
  {
    setTimeout(load_league, 100);
    return;
  }
  
  if(!params().get("league"))
  {
    return;
  }
  
  leagues = league_list.querySelectorAll("mat-tree-node .tree-node-name");
  if(!leagues.length)
  {
    setTimeout(load_league, 100);
    return;
  }
  for(league of leagues)
  {
    league_name = league.textContent.toUpperCase().replaceAll(" ", "");
    league_value = params().get("league").toUpperCase().replaceAll(" ", "");
    if(league_name == league_value)
    {
      league.click();
      load_event();
    }
  }
}

load_event = function()
{
  events = document.querySelectorAll("app-browse-odds-event-summary-card");
  if(!events.length)
  {
    setTimeout(load_event, 100);
    return;
  }
  
  team1 = params().get("team1");
  team2 = params().get("team2");
  
  for(event of events)
  {
    if(event.textContent.includes(team1) && event.textContent.includes(team2))
    {
      event.querySelector("mat-card").firstChild.click()
      select_correct_market();
    }
  }
}

dropdowns = function()
{
  return document.querySelectorAll("mat-select");
}

dropdown_options = function()
{
  return document.getElementsByClassName("mat-option-text");
}

select_correct_market = function()
{
  //if focus is unavailable, try again later
  if(!document.querySelector("app-browse-odds-table"))
  {
    setTimeout(select_correct_market, 100);
    return;
  }
  
  //Wait for event to finish loading and try again
  if(dropdowns().length == 0)
  {
    setTimeout(select_correct_market, 100);
    return;
  }
  
  //Change to correct market category if not already loaded
  if(params().get("segment") && dropdowns().length != 3)
  {
    select_correct_category();
    return;
  }
  
  //Select next category if we're in a market segment but not loading one
  if(!params().get("segment") && dropdowns().length == 3)
  {
    select_next_category();
    return;
  }
  
  //open market dropdown if closed and try again
  if(dropdown_options().length == 0)
  {
    dropdowns()[dropdowns().length-1].click();
    wait_until_dropdowns_open(select_correct_market);
    return;
  }
  
  //select the correct market if available
  for(dropdown_option of dropdown_options())
  {
    if(dropdown_option.textContent.includes(params().get("market")))
    {
      dropdown_option.click();
      wait_until_dropdowns_close(scroll_to_bet);
      return;
    }
  }
  
  //if there is no correct market, close the dropdown and select the next category
  document.getElementsByClassName("mat-selected")[0].click();
  wait_until_dropdowns_close(select_next_category);
}

select_correct_category = function()
{
  //if focus is unavailable, try again later
  if(!document.querySelector("app-browse-odds-table"))
  {
    setTimeout(select_correct_category, 100);
    return;
  }
  
  //Open the market categories if not already opened
  if(!dropdown_options().length)
  {
    dropdowns()[0].click();
    wait_until_dropdowns_open(select_correct_category);
    return;
  }
  
  segment = params().get("segment");
  //Select the proper category, then select the correct segment
  for(dropdown_option of dropdown_options())
  {
    if(segment.includes("Half") && dropdown_option.textContent.includes("Halves"))
    {
      dropdown_option.click();
      wait_until_dropdowns_close(select_correct_segment);
      return;
    }
    else if(segment.includes("Quarter") && dropdown_option.textContent.includes("Quarters"))
    {
      dropdown_option.click();
      wait_until_dropdowns_close(select_correct_segment);
      return;
    }
    else if(segment.includes("Period") && dropdown_option.textContent.includes("Periods"))
    {
      dropdown_option.click();
      wait_until_dropdowns_close(select_correct_segment);
      return;
    }
    else if(segment.includes("Set") && dropdown_option.textContent.includes("Set"))
    {
      params().delete("segment");
      dropdown_option.click();
      wait_until_dropdowns_close(select_correct_market);
      return;
    }
  }
}

select_correct_segment = function()
{
  //if focus is unavailable, try again later
  if(!document.querySelector("app-browse-odds-table"))
  {
    setTimeout(select_correct_segment, 100);
    return;
  }
  
  //open the segment dropdown if not open
  if(!dropdown_options().length)
  {
    dropdowns()[1].click();
    wait_until_dropdowns_open(select_correct_segment);
  }
  
  //open the correct segment, then select the market
  for(dropdown_option of dropdown_options())
  {
    if(params().get("segment").includes(dropdown_option.textContent.trim()))
    {
      dropdown_option.click();
      wait_until_dropdowns_close(select_correct_market);
      return;
    }
  }
}

select_next_category = function()
{
  //if focus is unavailable, try again later
  if(!document.querySelector("app-browse-odds-table"))
  {
    setTimeout(select_next_category, 100);
    return;
  }
  
  //open the categories if closed and try again
  if(!dropdown_options().length)
  {
    dropdowns()[0].click();
    wait_until_dropdowns_open(select_next_category);
    return;
  }
  
  //click the next category and then select correct market
  for(dropdown_option of dropdown_options())
  {
    if(dropdown_option.parentElement.classList.contains("mat-selected") && dropdown_option.parentElement.nextElementSibling)
    {
      dropdown_option.parentElement.nextElementSibling.firstElementChild.click();
      wait_until_dropdowns_close(select_correct_market);
    }
  }
  
  //If we've somehow reached the end, close the menu and do nothing
  dropdown_option.click();
}

scroll_to_bet = function()
{
  for(row of document.querySelectorAll(".odds-row-top, .odds-row-bottom"))
  {
    if(row.textContent.replaceAll(" ", "").includes(params().get("value").replaceAll(" ", "")))
    {
      row.scrollIntoView(false);
      return;
    }
  }
}

wait_until_dropdowns_close = function(f)
{
  if(dropdown_options().length)
  {
    setTimeout(wait_until_dropdowns_close, 100, f);
    return;
  }
  
  f();
}

wait_until_dropdowns_open = function(f)
{
  if(!dropdown_options().length)
  {
    setTimeout(wait_until_dropdowns_open, 100, f);
    return;
  }
  
  f();
}

autorefresh_odds  = function()
{
  new_odds = document.getElementsByClassName("mat-warn");
  if(new_odds.length && new_odds[0].textContent == " update ")
  {
    new_odds[0].click();
    setTimeout(refresh_odds, 100);
  }
}

refresh_odds = function()
{
  buttons = Array.from(document.getElementsByClassName("mat-button-wrapper"));
  for(button of buttons)
  {
    if(button.textContent == " Update ")
    {
      button.click();
    }
  }
}

add_ondblclick = function()
{
  markets = document.querySelectorAll(".primary-market-col, .hedge-market-col");
  for(market of markets)
  {
    if(!market.ondblclick )
    {
      market.ondblclick = market_dblclicked;
    }
  }
}

market_dblclicked = function(event)
{
  event_col_texts = textNodes(event.currentTarget.parentElement.getElementsByClassName("event-col")[0].childNodes);
  league = event_col_texts[0].textContent.trim();
  team1 = event_col_texts[1].textContent.trim();
  team2 = event_col_texts[2].textContent.trim();
  
  market_col = event.currentTarget;
  market = market_col.querySelector("app-market-chip").textContent.trim()
  segment = market_col.querySelector("app-segment-chip") ? market_col.querySelector("app-segment-chip").textContent.trim() : null;
  value = market_col.getElementsByClassName("market")[0].textContent.trim();
  
  //Quarter/Half markets combine alts and main lines into one page, so get rid of Alt Total
  market = segment && market == "Alt Total" ? "Total Score" : market;
  market = segment && market == "Alt Spread" ? "Spread" : market;
  
  query_string = `?league=${league}&team1=${team1}&team2=${team2}&market=${market}&value=${value}`;
  query_string = segment ? query_string + `&segment=${segment}` : query_string;
  browse_odds_url = "https://darkhorseodds.com/browse-odds"+query_string;
  window.open(browse_odds_url);
}

textNodes = function(nodes)
{
  let output = [];
  for(node of Array.from(nodes))
  {
    if(node.nodeType == 3)
    {
      output.push(node);
    }
  }
  return output;
}
ondblclick_id = setInterval(add_ondblclick, 100);
autorefresh_id = setInterval(autorefresh_odds, 100);
load_league();
