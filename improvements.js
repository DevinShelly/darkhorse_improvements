/* Variables */
{
  bankroll = 30000;
  kelly_fraction = 0.25;
  one_way_overround = 1.1;
}

/* DH seems to disable the console, so a quick workaround */
{
  let console_string = "";

  console_log = function(string)
  {
    console_string = console_string + string + "\n";
  }
  
  console_clear = function()
  {
    console_string = "";
  }
  
  console_display = function()
  {
    return console_string;
  }
}

/* Loading markets from parameterized browse-odds URL */
{
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
      if(dropdown_option.textContent.trim()  == params().get("market"))
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
        params().set("segment", segment.replace("Half", "").trim());
        return;
      }
      else if(segment.includes("Quarter") && dropdown_option.textContent.includes("Quarters"))
      {
        dropdown_option.click();
        wait_until_dropdowns_close(select_correct_segment);
        params().set("segment", segment.replace("Quarter", "").trim());
        return;
      }
      else if(segment.includes("Period") && dropdown_option.textContent.includes("Periods"))
      {
        dropdown_option.click();
        wait_until_dropdowns_close(select_correct_segment);
        params().set("segment", segment.replace("Period", "").trim());
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
      if(params().get("segment") == dropdown_option.textContent.trim())
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
}

/* Generating parameterized browse-odds URLs from bet finders and autorefreshing bets */
{
  check_for_autorefresh  = function()
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
  
  add_go_to_markets_events = function()
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
  
  /* Fix any discrepancies between bet finder and browse odds manually */
  sanitized_market_name = function(market, segment)
  {
    //Quarter/Half markets combine alts and main lines into one page, so get rid of Alt Total
    market = (segment && market) == "Alt Total" ? "Total Score" : market;
    market = (segment && market) == "Alt Spread" ? "Spread" : market;
    
    market = (market == "Total Match Games") ? "Total Games" : market;
    
    return market;
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
    market = sanitized_market_name(market, segment);
    
    
    
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
}

/* Devigging methods */
{
  add_devigging_events = function()
  {
    for (cell of document.querySelectorAll("app-browse-odds-table-single-cell"))
    {
      if(cell.onmouseover)
      {
        continue;
      }
      
      cell.parentElement.onmouseover = add_devigged_odds_to_title;
      cell.parentElement.oncontextmenu = add_to_parlay;
      cell.parentElement.onclick = toggle_soft_line;
    }
  }
  
  cells_from_row = function(row)
  {
    return row.querySelectorAll("td.book-col");
  }
  
  const soft_class = "soft-class";
  const sharp_class = "sharp-class";
  
  toggle_soft_line = function(event)
  {
    cell = event.currentTarget;
    row = cell.parentElement;
    
    if(cell.textContent.trim() == "-")
    {
      return;
    }
    
    if(event.currentTarget.classList.contains(soft_class))
    {
      make_row_normal(row);
    }
    else
    {
      make_cell_soft(cell);
      make_row_sharp(row);
    }
  }
  
  make_row_sharp = function(row)
  {
    soft_cell = row.querySelector(`.${soft_class}`);
    for(cell of cells_from_row(row))
    {
      if(cell.classList.contains(soft_class))
      {
        continue;
      }
      
      make_cell_sharp(cell, soft_cell);
    }
  }
  
  make_cell_sharp = function(cell, soft_cell)
  {
    soft_odds = parseInt(soft_cell.textContent);
    devigged_cell_odds = parseInt(devigged_odds_for_cell(cell).power);
    if(isNaN(devigged_cell_odds))
    {
      return;
    }
    
    ev_bet = soft_odds > devigged_cell_odds;
    background_color = ev_bet ? "LightGreen" : "LightPink";
    
    cell.classList.add(sharp_class);
    cell.firstElementChild.firstElementChild.style.color = "Black";
    cell.firstElementChild.firstElementChild.style.backgroundColor = background_color;
    add_ev_to_title(cell, soft_cell);
  }
  
  make_cell_soft = function(cell)
  {
    row = cell.parentElement;
    for(previous_soft_cell of row.getElementsByClassName(soft_class))
    {
      previous_soft_cell.classList.remove(soft_class);
    }
    cell.classList.add(soft_class);
    cell.firstElementChild.firstElementChild.style.color = "Black";
    cell.firstElementChild.firstElementChild.style.backgroundColor = "Yellow";
  }
  
  make_row_normal = function(row)
  {
    for(cell of cells_from_row(row))
    {
      make_cell_normal(cell);
    }
  }
  
  make_cell_normal = function(cell)
  {
    cell.classList.remove(soft_class);
    cell.classList.remove(sharp_class);
    cell.firstElementChild.firstElementChild.style.backgroundColor = "rgb(29, 39, 49)";
    cell.firstElementChild.firstElementChild.style.color = "White";
    cell.removeAttribute("title");
  }
  
  add_to_parlay = function()
  {
    return false;
  }
  
  add_devigged_odds_to_title = function(event)
  {
    cell = event.currentTarget;
    if(isNaN(parseFloat(cell.textContent)))
    {
      return;
    }
    
    devigged_odds = devigged_odds_for_cell(cell);
    devigged_percentages = devigged_percentages_for_cell(cell);
    if(!cell.title)
    {
      cell.title = `Fair: ${(devigged_odds.power)} (${(devigged_percentages.power*100).toFixed(1)}%)`;
    }
  }
  
  add_ev_to_title = function(sharp_cell, soft_cell)
  {
    sharp_odds = devigged_odds_for_cell(sharp_cell);
    sharp_percentages = devigged_percentages_for_cell(sharp_cell);
    soft_percentages = devigged_percentages_for_cell(soft_cell);
    ev = (expected_value(sharp_percentages.power, soft_cell.textContent)*100).toFixed(1) +"%";
    full_kelly = kelly_percentage(sharp_percentages.power, soft_cell.textContent);
    full_kelly_bet = "$" + (bankroll*full_kelly).toFixed();
    full_kelly_pct = (full_kelly*100).toFixed(1) + "%";
    fractional_kelly_bet = "$" + (full_kelly*bankroll*kelly_fraction).toFixed();
    fractional_kelly_pct = (full_kelly *100*kelly_fraction).toFixed(1) + "%";
    
    sharp_cell.title = `Fair: ${sharp_odds.power} (${(100*sharp_percentages.power).toFixed(1)}%)\nEV: ${ev}\nFull Kelly: ${full_kelly_bet} (${full_kelly_pct})\nFractional Kelly: ${fractional_kelly_bet} (${fractional_kelly_pct})`;
  }
  
  kelly_percentage = function(win_percentage, odds)
  {
    odds = parseFloat(odds);
    fractional_odds = odds/100;
    if(odds < 0)
    {
      fractional_odds = -100/odds;
    }
    win_percentage = parseFloat(win_percentage);
    return Math.max(0, win_percentage - (1-win_percentage)/fractional_odds);
  }
  
  expected_value = function(win_percentage, odds)
  {
    odds = parseFloat(odds);
    win_percentage = parseFloat(win_percentage);
    if(odds > 0)
    {
      return (win_percentage * odds - 100*(1.0-win_percentage))/100;
    }
    
    return (100*win_percentage + odds * (1.0-win_percentage))/(-odds);
  }
  
  devigged_percentages_for_cell = function(cell)
  {
    devigged_odds = devigged_odds_for_cell(cell);
    return {power: odds_to_percentage(devigged_odds.power), standard: odds_to_percentage(devigged_odds.standard)};
  }
  
  devigged_odds_for_cell = function(cell)
  {
    odds = [cell.textContent];
    row = cell.parentElement;
    cell_index = Array.from(row.childNodes).indexOf(cell);
    if(row.classList.contains("odds-row-top") || row.classList.contains("odds-row-middle"))
    {
      odds.push(row.nextElementSibling.childNodes[cell_index].textContent);
      if(row.nextElementSibling.classList.contains("odds-row-middle"))
      {
        odds.push(row.nextElementSibling.nextElementSibling.childNodes[cell_index].textContent);
      }
    }
    
    if(row.classList.contains("odds-row-bottom") || row.classList.contains("odds-row-middle"))
    {
      odds.push(row.previousElementSibling.childNodes[cell_index].textContent);
      if(row.previousElementSibling.classList.contains("odds-row-middle"))
      {
        odds.push(row.previousElementSibling.previousElementSibling.childNodes[cell_index].textContent);
      }
    }
    
    return {standard: devigged_standard(odds), power: devigged_power(odds)};
  }
  
  parse_odds_to_percentages = function(odds)
  {
    percentages = odds.map(o => isNaN(parseFloat(o)) ? 0 : odds_to_percentage(o));
    total_overround = percentages.reduce((overround, percentage) => overround + percentage);
    /* Can't devig an empty market */
    if(total_overround == 0)
    {
      return null;
    }
    
    /* Assuming missing odds is a one-way market, add the default overround in */
    percentages = percentages.map(percentage => percentage == 0 ? one_way_overround-total_overround : percentage);
    
    return percentages;
  }
  
  devigged_standard = function(odds)
  {
    percentages = parse_odds_to_percentages(odds);
    if(!percentages)
    {
      return null;
    }
    
    overround = percentages.reduce((accumulated_overround, percentage) => accumulated_overround = accumulated_overround + percentage);
    return percentage_to_odds(percentages[0]/overround);
  }
  
  devigged_power = function(odds)
  {
    percentages = parse_odds_to_percentages(odds);
    if(!percentages)
    {
      return null;
    }
    
    pows = [1.0, 10.0];
    for(i = 0; i<100; i++)
    {
      pow = (pows[0] + pows[1])/2;
      overround = 0;
      for(percentage of percentages)
      {
        overround = overround + Math.pow(percentage, pow);
      }
      if(overround < 1.0)
      {
        pows = [pows[0], pow];
      }
      else
      {
        pows = [pow, pows[1]];
      }
    }
    return percentage_to_odds(Math.pow(percentages[0], (pows[0] + pows[1])/2.0));
  }
  
  odds_to_percentage = function(odds)
  {
    odds = parseFloat(odds);
    if(odds > 0)
    {
      return 100.0/(100.0 + odds);
    }
    else
    {
      return odds/(odds-100);
    }
  }
  
  percentage_to_odds = function(percentage)
  {
    percentage = parseFloat(percentage);
    if(percentage > 0.5)
    {
      return -1*Math.round((100*percentage)/(1-percentage));
    }
    
    return "+" + Math.round(100*(1-percentage)/percentage);
  }
}

/* On initial load */
{
  go_to_markets_events_id = setInterval(add_go_to_markets_events, 100);
  check_for_autorefresh_id = setInterval(check_for_autorefresh, 100);
  devigging_events_id = setInterval(add_devigging_events, 100);
  load_league();
}
