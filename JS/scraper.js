// singles_matches winner_info
let winner_character_id = [];
let winner_unique_amiibo_id = [];
let winner_name = [];
let winner_rating = [];
let winner_rating_mu = [];
let winner_rating_sigma = [];
let winner_trainer_id = [];
let winner_trainer_name = [];


// singles_matches loser_info
let loser_character_id = [];
let loser_unique_amiibo_id = [];
let loser_name = [];
let loser_rating = [];
let loser_rating_mu = [];
let loser_rating_sigma = [];
let loser_trainer_id = [];
let loser_trainer_name = [];

let created_at = [];

// Page counters
let pageNumber = 0;
let foundMatches = 0;
let corruptMatches = 0;

async function fetchMatches(next) {
    try {
    let nextEncoded = encodeURIComponent(next);
    let cursor = `cursor=${nextEncoded}`;
    let per_page = 'per_page=1000';
    let created_at_start = 'created_at_start=2018-11-10T00%3A00%3A00Z';
    // vanilla:     44748ebb-e2f3-4157-90ec-029e26087ad0
    // b5b:         328d8932-456f-4219-9fa4-c4bafdb55776
    // ag:          af1df0cd-3251-4b44-ba04-d48de5b73f8b
    let ruleset_id = 'ruleset_id=44748ebb-e2f3-4157-90ec-029e26087ad0';

    let URL = `https://www.amiibots.com/api/singles_matches?${cursor}&${per_page}&${created_at_start}&${ruleset_id}`;

    const singles_matches_query = await fetch(URL);
    const singles_matche_query_response = await singles_matches_query.json();
    const response_data = singles_matche_query_response.data.map(
        function(data) {
            try {
                // singles_matches winner_info
                winner_character_id.push(data.winner_info.character_id);
                winner_unique_amiibo_id.push(data.winner_info.id);
                winner_name.push(data.winner_info.name);
                winner_rating.push(data.winner_info.rating);
                winner_rating_mu.push(data.winner_info.rating_mu);
                winner_rating_sigma.push(data.winner_info.rating_sigma);
                winner_trainer_id.push(data.winner_info.trainer_id);
                winner_trainer_name.push(data.winner_info.trainer_name);
                

                // singles_matches loser_info
                loser_character_id.push(data.loser_info.character_id);
                loser_unique_amiibo_id.push(data.loser_info.id);
                loser_name.push(data.loser_info.name);
                loser_rating.push(data.loser_info.rating);
                loser_rating_mu.push(data.loser_info.rating_mu);
                loser_rating_sigma.push(data.loser_info.rating_sigma);
                loser_trainer_id.push(data.loser_info.trainer_id);
                loser_trainer_name.push(data.loser_info.trainer_name);

                created_at.push(data.created_at);
                foundMatches++;
            } catch {
                corruptMatches++;
                console.log(`Corrupt match at ${data.created_at}`);
            }
    });

    console.log(singles_matche_query_response.data);
    console.log(singles_matche_query_response.pagination.cursor.next);

    pageNumber++;
    document.getElementById('pages').innerText = `Page ${pageNumber} of ${singles_matche_query_response.pagination.total_pages}`;
    document.getElementById('foundMatches').innerText = `Found matches = ${foundMatches}`;
    document.getElementById('corruptMatches').innerText = `Corrupt matches = ${corruptMatches}`;

    // Constantly loop until all matches have been found
    fetchMatches(singles_matche_query_response.pagination.cursor.next);
    // Uncomment this (and comment out the line above) to loop once and download the json
    // createJSON();

    } catch (err) {
        console.log(err);
        // Downloads the json once the end of the match history has been reached
        await createJSON();
    }
}

async function createJSON() {
    // create an array of data
    const data = [];
    for (let i = 0; i < created_at.length; i++) {
        data.push({ 
            winner_character_id: winner_character_id[i], 
            winner_unique_amiibo_id: winner_unique_amiibo_id[i],
            winner_name: winner_name[i], 
            winner_rating: winner_rating[i], 
            winner_rating_mu: winner_rating_mu[i],
            winner_rating_sigma: winner_rating_sigma[i],
            winner_trainer_id: winner_trainer_id[i], 
            winner_trainer_name: winner_trainer_name[i], 
            
            loser_character_id: loser_character_id[i],
            loser_unique_amiibo_id: loser_unique_amiibo_id[i],
            loser_name: loser_name[i],
            loser_rating: loser_rating[i],
            loser_rating_mu: loser_rating_mu[i],
            loser_rating_sigma: loser_rating_sigma[i],
            loser_trainer_id: loser_trainer_id[i],
            loser_trainer_name: loser_trainer_name[i],

            created_at: created_at[i]
        });

    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
}

// you last commented out 4 lines to help reduce how much data is stored so only what is needed is saved.