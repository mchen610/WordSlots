import "./PlayPage.css";
import { useState, useEffect } from "react";
import classNames from "classnames";
import rawWords from "./words.txt";
import { Button } from "./Buttons";
import { Letter, Word } from "./Letter";
import Footer from "./Footer";
import Header from "./Header";

//https://stackoverflow.com/questions/54895883/reset-to-initial-state-with-react-hooks

const letters: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const duration = 3;
let words: string[] = [];

fetch(rawWords)
    .then((response) => response.text())
    .then((content) => {
        words = content.split("\r\n");
    })
    .catch((error) => {
        console.error("Error fetching file:", error);
    });

function shuffle(list: string[]) {
    return list
        .map((item) => ({ item, value: Math.random() }))
        .sort((a, b) => a.value - b.value)
        .map(({ item }) => item);
}

function newletterList() {
    let newLetters = shuffle(letters);
    newLetters.push(newLetters[0]);
    newLetters.push(newLetters[1]);
    newLetters.push(newLetters[2]);
    return newLetters;
}

export default function PlayPage() {
    const [colLists, setColLists] = useState({
        left: newletterList(),
        center: newletterList(),
        right: newletterList(),
    });

    const [finalLeft, setFinalLeft] = useState<string[]>([]);

    const [finalCenter, setFinalCenter] = useState<string[]>([]);

    const [finalRight, setFinalRight] = useState<string[]>([]);

    const [finalWords, setFinalWords] = useState<string[]>([]);

    const [validWords, setValidWords] = useState<string[]>([]);

    const [newValidWords, setNewValidWords] = useState<string[]>([]);

    const finalColumnList: string[][] = [];

    const handleFinishedCol = (finalColumn: string[]) => {
        finalColumnList.push(finalColumn);
    };

    useEffect(() => {
        for (let i = 0; i < finalWords.length; i++) {
            if (words.includes(finalWords[i])) {
                setValidWords((prevValidWords) => [
                    ...prevValidWords,
                    finalWords[i],
                ]);
                setNewValidWords((prevValidWords) => [
                    ...prevValidWords,
                    finalWords[i],
                ]);
            }
        }
    }, [finalWords]);

    const handleFinished = () => {
        //horizontal
        for (let i = 0; i < finalCenter.length; i++) {
            setFinalWords((prevWords) => [
                ...prevWords,
                finalLeft[i] + finalCenter[i] + finalRight[i],
            ]);
        }

        //vertical
        setFinalWords((prevWords) => [
            ...prevWords,
            finalLeft.join(""),
            finalCenter.join(""),
            finalRight.join(""),
        ]);

        //diagonal
        setFinalWords((prevWords) => [
            ...prevWords,
            finalLeft[0] + finalCenter[1] + finalRight[2],
        ]);
        setFinalWords((prevWords) => [
            ...prevWords,
            finalLeft[2] + finalCenter[1] + finalRight[0],
        ]);
    };

    const setFinal = (
        place: "left" | "center" | "right",
        letterIndex: number
    ) => {
        if (place === "left") {
            setFinalLeft(colLists["left"].slice(letterIndex, letterIndex + 3));
        } else if (place === "center") {
            setFinalCenter(
                colLists["center"].slice(letterIndex, letterIndex + 3)
            );
        } else if (place === "right") {
            setFinalRight(
                colLists["right"].slice(letterIndex, letterIndex + 3)
            );
        }
    };

    const slotCol = (
        place: "left" | "center" | "right",
        newStartTime: DOMHighResTimeStamp
    ) => {
        const [stopped, setStopped] = useState(false);
        const [offset, setOffset] = useState(0);
        const [startTime, setStartTime] = useState(0);

        if (newStartTime != startTime) {
            setStopped(false);
            setStartTime(newStartTime);
        }

        return (
            <div
                style={{
                    animationDuration: String(duration) + "s",
                    transform: stopped ? `translateY(-${offset}%)` : "",
                }}
                {...(startTime > 0 &&
                    !stopped && {
                        onClick: () => {
                            let letterTime = (duration * 1000) / letters.length;
                            let elapsedTime = performance.now() - startTime;
                            let letterIndex =
                                (Math.floor(elapsedTime / letterTime) %
                                    letters.length) +
                                1;
                            let newOffset =
                                (letterIndex / colLists[place].length) * 100;
                            console.log(newOffset);
                            console.log(letterIndex);
                            setOffset(newOffset);
                            setStopped(true);
                            setFinal(place, letterIndex);
                        },
                    })}
                className={classNames(
                    "slot-container",
                    { stopped: stopped },
                    { started: startTime > 0 }
                )}
            >
                {colLists[place].map((letter, index) => Letter(letter, index))};
            </div>
        );
    };

    if (
        finalWords.length === 0 &&
        finalLeft.length > 0 &&
        finalCenter.length > 0 &&
        finalRight.length > 0
    ) {
        handleFinished();
    }

    const randLeft = () => {
        let leftOrRight = Math.floor(Math.random() * 2) % 2 === 0;
        let offset = Math.floor(Math.random() * 20) + 10;
        return leftOrRight ? 100 - offset : offset;
    };

    const randTop = () => {
        let topOrBot = Math.floor(Math.random() * 2) % 2 === 0;
        let offset = Math.floor(Math.random() * 20) + 20;
        return topOrBot ? 100 - offset : offset;
    };

    const randAngle = () => {
        return Math.floor(Math.random() * 2) % 2 === 0 ? 30 : -30;
    };

    const [startTime, setStartTime] = useState(0);

    return (
        <>
            <title>Play</title>
            <Header mode="light" />
            <div className="play-container">
                {newValidWords.map((word) => (
                    <div
                        className="word-container"
                        key={word}
                        style={{
                            transform: `rotate(${randAngle()}deg)`,
                            top: `${randTop()}%`,
                            left: `${randLeft()}%`,
                        }}
                    >
                        {Word(word)}
                    </div>
                ))}
                <span className="play-bg" />
                <div className="machine">
                    <span className="machine-front" />

                    <div className="slot">{slotCol("left", startTime)}</div>
                    <div className="slot">{slotCol("center", startTime)}</div>
                    <div className="slot">{slotCol("right", startTime)}</div>
                </div>

                {startTime > 0 && (
                    <div className="retry-container">
                        <Button
                            className="button retry-button"
                            imgLink="images/retry-button.png"
                            onClickHandler={() => {
                                setColLists({
                                    left: newletterList(),
                                    center: newletterList(),
                                    right: newletterList(),
                                });
                                setStartTime(performance.now());
                                setFinalLeft([]);
                                setFinalCenter([]);
                                setFinalRight([]);
                                setFinalWords([]);
                                setNewValidWords([]);
                            }}
                        />
                    </div>
                )}
            </div>
            <Footer mode="dark" />
            {startTime === 0 && (
                <Button
                    className="button play-button"
                    imgLink="images/play-button.svg"
                    onClickHandler={() => setStartTime(performance.now())}
                />
            )}
        </>
    );
}
