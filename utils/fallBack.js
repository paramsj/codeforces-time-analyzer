function getResponse(totalSeconds) {
    if(totalSeconds<=3600) {
        return "You've spent a few minutes on this. The bug is still there, isn't it?";
    }
    if(totalSeconds<=86400) {
        return "That's enough time for an O(N^2) solution to pass on a first test case and then TLE on the second.";
    }
    const booksUnread = totalSeconds/(60*60*7.5);
    const songsUnheard = totalSeconds/(60*3.5);
    const flights = totalSeconds/(60*60*15);
    //return "Wow that like soo many unheard songs!";
    return "Wow, that's enough time to read " + Math.floor(booksUnread) + " books, listen to " + Math.floor(songsUnheard) + " songs, or take " + Math.floor(flights) + " flights from New York to Shanghai!";
}

export {getResponse};