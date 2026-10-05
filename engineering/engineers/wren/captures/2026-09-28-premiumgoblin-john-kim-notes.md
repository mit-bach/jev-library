author: John Kim
handle: @PremiumGoblin
post id: 2104597826378580379
timestamp: 2026-09-28T15:43:18Z
url: https://x.com/PremiumGoblin/status/2104597826378580379
engagement: likes 11, reposts 0, quotes 0, replies 0, bookmarks 10, views 3009
This is a saved post, not an official TypeSafe document.

John Kim's bio says Senior Staff Software Engineer at Meta. His handle is @PremiumGoblin, not a John Kim handle.

@0xTreff post 2105757266280419829 (2026-10-01, likes 2, bookmarks 1, views 98) says: Meta senior staff engineer John Kim, "You don't actually use Jev like you would use a chatbot," 25 minutes on what Jev does inside your code and where it fails, a voice canvas and a game agent, then "read the guide below." The quoted post is Alpha Batcher's article, which does not name John Kim. That article is saved as 2026-09-27-alphabatcher-jev-for-beginners.md. Treff's post also attaches a video of 1,510,806 ms, about 25.2 minutes.

The YouTube video John Kim linked is https://www.youtube.com/watch?v=fgNf9nFXO_I. Its description, copied 2026-10-01, is below. A spoken transcript was not recovered. yt-dlp was not installed. The YouTube timedtext URL for the English captions returned HTTP 200 and an empty body. The video itself was not saved.

An earlier post, 2101146698366206386, is the written note of the World of Warcraft attempt. It is included because it is the method he wrote down. A 22 September reply about Laya and network latency is included because it is his own limit on the speed claim. One-line replies were left out.

---

## 28 September 2026, post 2104597826378580379

I’ve been playing around with Jev. Tried to play world of Warcraft with it. Here is what I learned

Everything you need to know about Jev
https://www.youtube.com/watch?v=fgNf9nFXO_I&feature=youtu.be

## YouTube description, not a transcript

What is Jev, and what is it actually doing in those fast AI demos? I built a voice controlled canvas and a World of Warcraft agent to find out.

I break down TypeSafe's decision model, the speed and cost claims, Choice, Score and Noul, and the code needed to turn a model's decisions into useful actions. Then I show where our experiments worked, where they failed, and how Codex, Jev and scripted behaviors worked together.

This is a practical look at where a fast classifier fits in software. The WoW demo used custom game-state signals, programmed behaviors and Codex supervision; it wasn't Jev independently learning to play.

Chapters listed on the page, only the portion that was visible in the page source before it was cut:

- 00:00 What is Jev?
- 03:22 How Jev works
- 07:12 Using Jev: decisions and code
- 10:58 What the game demos are doing
- 14:43 My voice-con

The rest of the chapter list was truncated in the source that was fetched. It is not guessed here.

## 19 September 2026, post 2101146698366206386

Timestamp 2026-09-19T03:09:44Z. Likes 24, reposts 1, replies 10, bookmarks 6, views 5022.

I've been seeing a lot of fake looking demos online of people using Jev to play video games perfectly in real time.

I'm hella suss'd by the demos so i'm trying to build one right now. So far its kind of shit tbh especially since I don't have raw game state from WOW.

I'm essentially trying to recreate the game state from pixel data of key elements of the game and have Jev just make decisions on what to do next.

The issue is even if it decides what to do next I'll need an entire bot code that handles playing the game itself.

So if you had these two elements
1. perfect game state
2. bot code that knows how to play the game already

Then Jev is the perfect decision maker to give commands to the bot.

## 22 September 2026, post 2102228361888350622

Timestamp 2026-09-22T02:47:53Z. Likes 16, replies 5, bookmarks 23, views 11372. This replies to a claim that local Laya beat Jev at Tetris by making decisions 11 times faster.

I wonder how much of it is just network latency. Jev never mentioned if its models can run locally or not. I don’t think we know the size of it yet.

But yea some people saying Laya accuracy is not up to par with Jev which I would believe but I think that argument is missing the point.

For any given task there is a minimum bar of intelligence needed to do that task. If Laya can do it faster and cheaper for some specific task it just wins.
