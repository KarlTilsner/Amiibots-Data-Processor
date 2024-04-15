# How to use
1. Go to https://www.amiibots.com/api/docs and open the singles_matches endpoint.
2. Set per_page to '1' and set created_at_start to '2018-11-10T00:00:00Z'
3. Execute and then copy the date found at 'pagination.cursor.next'
4. Paste the date into line 25 in 'index.html'
5. Open 'index.html' in a live server and wait for all the data to scrape. The program should start automatically.

- The program is set to scrape all vanilla matches by default. This can be changed by modifying line 38 in 'scraper.js'