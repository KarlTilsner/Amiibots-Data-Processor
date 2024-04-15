const all_matches = [];
const all_characters = [];

// Queries all matches and loads them into an object
//---------------------------------------------------------------------------------------------------------------------------------------------------------
async function get_all_matches() {
    const url = `./json/data.json`;
    const query = await fetch(url);
    const response = await query.json();
    response.map(index => all_matches.push(index));
    console.log("JSON Loaded:", all_matches);
}





// Queries all character names and IDs and loads them into an object
//---------------------------------------------------------------------------------------------------------------------------------------------------------
async function get_all_characters() {
    const url = `https://www.amiibots.com/api/utility/get_all_characters`;
    const query = await fetch(url);
    const response = await query.json();
    response.data.map(index => all_characters.push(index));
    console.log("Got all character names and ids", all_characters);
}





// SORTS THROUGH ALL MATCHES AND TALLIES UP ALL WINS/LOSSES PER CHARACTER
//---------------------------------------------------------------------------------------------------------------------------------------------------------
async function processMatchupData() {
    const completeMatchups = [];

    all_characters.forEach(e_character => {
        const dataToPush = {
            id: e_character.id,
            name: e_character.name,

            data: all_characters.map(character => ({
                name: character.name,
                id: character.id,
                wins: 0,
                losses: 0
            }))
        };

        all_matches.forEach(e_match => {
                if (e_character.id === e_match.winner_character_id) {
                    const opponentId = e_match.loser_character_id;
                    const opponentIndex = dataToPush.data.findIndex(opponent => opponent.id === opponentId);
                    if (opponentIndex !== -1) {
                        dataToPush.data[opponentIndex].wins++;
                    }
                } 
                
                if (e_character.id === e_match.loser_character_id) {
                    const opponentId = e_match.winner_character_id;
                    const opponentIndex = dataToPush.data.findIndex(opponent => opponent.id === opponentId);
                    if (opponentIndex !== -1) {
                        dataToPush.data[opponentIndex].losses++;
                }
            }
        });

        completeMatchups.push(dataToPush);

    });

    console.log(completeMatchups);
    
    async function downloadJSON() {
        const json = JSON.stringify(completeMatchups, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AmiibotsMatchupData.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    downloadJSON(); // Downloads the matchups data after it is processed
}





// SORTS THROUGH ALL MATCHES AND CREATES THE DATA FOR THE HIGHEST RATING HISTORY
//---------------------------------------------------------------------------------------------------------------------------------------------------------
async function processHighestRatingHistory() {

    async function get_each_week() {
        const data = [];
        let weeklyMatches = [];
        let prevDate = 0;
        let currDate = 0;
        let totalWeeks = 0;
        let totalMatches = 0;
        
        // const query = await fetch(`./json/data.json`);
        // const response = await query.json();
    
        prevDate = new Date(all_matches[0].created_at).toISOString().substring(0, 10);
    
        await all_matches.reduce(async (previousPromise, index) => {
            await previousPromise;
    
            currDate = new Date(index.created_at).toISOString().substring(0, 10);
    
            let temp = new Date(currDate);
            let currDate7DaysAgo = new Date(temp.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
            if (currDate7DaysAgo === prevDate) {
                await pushData();
            }
            weeklyMatches.push(index);
            totalMatches++;
        }, Promise.resolve());
    
        await pushData();            

        async function pushData() {
            totalWeeks++;
            prevDate = currDate;
            // console.log(weeklyMatches);
            data.push(weeklyMatches);
            weeklyMatches = [];
            await delay(10); // Introduce a delay of 1 second
        }
        
        function delay(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
    
        return data;
    }

    const combinedAmiibotsMatchData = await get_each_week();

    // HIGHEST RATING HISTORY CODE
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    async function createHighestRatingHistoryData(data) {
        const specifiedCharacter = data.id;
        const specifiedCharacterName = data.name;

        let highestRatedHistory = [];
        let currentWeek = 0;

        // Find all the unique amiibo for the specified character
        const unique_amiibo = [];
        combinedAmiibotsMatchData.map(week => {
            week.map(match => {
                if (match.winner_character_id == specifiedCharacter) {
                    if (!unique_amiibo.some(amiibo => amiibo.id == match.winner_unique_amiibo_id)) {
                        unique_amiibo.push({
                            name: match.winner_name,
                            id: match.winner_unique_amiibo_id
                        });
                    }
                }

                if (match.loser_character_id == specifiedCharacter) {
                    if (!unique_amiibo.some(amiibo => amiibo.id == match.loser_unique_amiibo_id)) {
                        unique_amiibo.push({
                            name: match.loser_name,
                            id: match.loser_unique_amiibo_id
                        });
                    }
                }

            });
        });

        // For each unique amiibo, collect all their recorded matches
        const all_amiibo_rating_history = [];

        unique_amiibo.map(amiibo => {

            let weekNo = 0;
            const induvidual_amiibo_rating_history = {
                name: amiibo.name,
                id: amiibo.id,
                data: []
            };

            const reversedCombinedAmiibotsMatchData = [...combinedAmiibotsMatchData].reverse();
            reversedCombinedAmiibotsMatchData.map(week => {

                weekNo++;
                let temp = [];
                
                week.map(match => {

                    if (match.winner_unique_amiibo_id == amiibo.id) {
                        temp.push({
                            trainer_name: match.winner_trainer_name,
                            trainer_id: match.winner_trainer_id,
                            
                            amiibo_name: match.winner_name,
                            unique_amiibo_id: match.winner_unique_amiibo_id,

                            rating: match.winner_rating,
                            rating_sigma: match.winner_rating_sigma,

                            current_week: null
                        });
                    } 
                    
                    if (match.loser_unique_amiibo_id == amiibo.id) {
                        temp.push({
                            trainer_name: match.loser_trainer_name,
                            trainer_id: match.loser_trainer_id,
                            
                            amiibo_name: match.loser_name,
                            unique_amiibo_id: match.loser_unique_amiibo_id,

                            rating: match.loser_rating,
                            rating_sigma: match.loser_rating_sigma,

                            current_week: null
                        });
                    }
                });

                induvidual_amiibo_rating_history.data.push({
                    matches: [...temp].reverse(),
                    weekNo
                });
            });
            all_amiibo_rating_history.push(induvidual_amiibo_rating_history);
        });

        // Fill in blank spaces where the amiibo hasnt had a match during the week with their previous score
        all_amiibo_rating_history.map(amiibo => {
            
            // For each week
            for (let i = 0; i < amiibo.data.length; i++) {
                
                // Check if amiibo hasnt played in that week and make sure it played the week before
                if (i > 0 && amiibo.data[i].matches.length == 0 && amiibo.data[i - 1].matches.length > 0) {
                    amiibo.data[i].matches.push(amiibo.data[i - 1].matches[amiibo.data[i - 1].matches.length - 1]);
                }
                
            }

        });

        // Iterate over the first week of every amiibo and then determine who had the highest rating
        const highest_rating = [];
        for (let i = 0; i < combinedAmiibotsMatchData.length; i++) {
            const temp = [];
            all_amiibo_rating_history.map(amiibo => {
                temp.push(amiibo.data[i].matches);
                
            });

            let highestRating = {rating: 0};
            temp.map(amiibo => {
                amiibo.map(match => {
                    if (match.rating > highestRating.rating && match.rating_sigma < 2.5) {
                        highestRating = match;
                    }
                });
            });

            highest_rating.push(highestRating);
        }

        let current_week_counter = 0;
        const rating_history = [];

        highest_rating.map(index => {
            current_week_counter++;
            if (index.rating) {
               rating_history.push({ ...index, current_week: current_week_counter }); 
            }
        });
        
        const dataFinal = {
            'name': data.name,
            'id': data.id,
            rating_history
        }
        console.log(`${specifiedCharacterName}'s Rating History`, dataFinal);
        
        await downloadCharacterJSON(dataFinal); // Download each character rating history

        async function downloadCharacterJSON(characterJSON) {
            const json = JSON.stringify(characterJSON, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${specifiedCharacterName} Rating History.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    all_characters.map(async function (e) {await createHighestRatingHistoryData(e)}); // Create rating history for all characters

    // await createHighestRatingHistoryData({id: 'cc43dc32-d6fd-43eb-be16-47c498521272', name: 'Fox'}); // Only run this loop for one character
}





// Activate functions here
//---------------------------------------------------------------------------------------------------------------------------------------------------------
async function processData() {
    await get_all_matches();
    await get_all_characters();
    await processMatchupData();                // Generates matchups for each character
    await processHighestRatingHistory();       // Generates each characters rating history
}
