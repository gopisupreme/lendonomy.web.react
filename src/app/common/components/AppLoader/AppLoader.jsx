import React from "react";
import { useSelector } from "react-redux";

import loader from "../../../../assets/img/leaf-falling_final.gif";
import styles from "./AppLoader.module.scss";

export default () => {
  const { showLoader } = useSelector((store) => store.app);

  const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  return (
    <>
      {showLoader && (
        <div className={styles.overlay}>
          <div className={styles.innerlay}>
            <div className={styles.loaderContainer}>
              <img src={loader} />
            </div>
            <div className={styles.quoteContainer}>
              <h1>{quotes[getRandomInt(quotes.length)]}</h1>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const quotes = [
  `"The greatest glory in living lies not in never falling, but in rising every time we fall."\n\n - Nelson Mandela`,
  `"The way to get started is to quit talking and begin doing."\n\n - Walt Disney`,
  `"Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking."\n\n - Steve Jobs`,
  `"If life were predictable it would cease to be life, and be without flavor."\n\n - Eleanor Roosevelt`,
  `"If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough."\n\n - Oprah Winfrey`,
  `"If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success."\n\n - James Cameron`,
  `"Life is what happens when you're busy making other plans."\n\n - John Lennon`,
  `"You are never given a dream without also being given the power to make it true."\n\n - Richard Bach`,
  `"We are what we repeatedly do. Excellence, then, is not an act, but a habit."\n\n - Aristotle`,
  `"Decide what you want. Believe you can have it. Believe you deserve it and believe it’s possible for you."\n\n - Jack Canfield`,
  `"Success is walking from failure to failure with no loss of enthusiasm."\n\n - Winston Churchill`,
  `"Believe you can and you’re halfway there."\n\n - Theodore Roosevelt`,
  `"Don’t let what you cannot do interfere with what you can do."\n\n - John Wooden`,
  `"Anyone who has ever made anything of importance was disciplined."\n\n - Andrew Hendrixson`,
  `"Don’t spend time beating on a wall, hoping to transform it into a door."\n\n - Coco Chanel`,
  `"Optimism is the one quality more associated with success and happiness than any other."\n\n - Brian Tracy`,
  `"Don’t live the same year 75 times and call it a life."\n\n - Robin Sharma`,
  `"There is no way to happiness. Happiness is the way."\n\n - Thich Nhat Hanh`,
  `"Champions keep playing until they get it right."\n\n - Billie Jean King`,
  `"Genius is 1% inspiration, 99% perspiration."\n\n - Thomas Edison`,
  `"Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway."\n\n - Earl Nightingale`,
  `"Instead of wondering when your next vacation is, maybe you should set up a life you don’t need to escape from."\n\n - Seth Godin`,
  `"Sometimes you win, sometimes you learn."\n\n - John Maxwell`,
  `"I never dream of success. I worked for it."\n\n - Estee Lauder`,
  `"We become what we think about."\n\n - Earl Nightingale`,
  `"Twenty years from now you will be more disappointed by the things that you didn’t do than by the ones you did do. "\n\n - Mark Twain`,
  `"You can never cross the ocean until you have the courage to lose sight of the shore."\n\n - Christopher Columbus`,
  `"Either you run the day, or the day runs you."\n\n - Jim Rohn`,
  `"Whether you think you can or you think you can’t, you’re right."\n\n - Henry Ford`,
  `"There is only one way to avoid criticism: do nothing, say nothing, and be nothing."\n\n - Aristotle`,
  `"Start where you are. Use what you have. Do what you can."\n\n - Arthur Ashe`,
  `"Life is not measured by the number of breaths we take, but by the moments that take our breath away."\n\n - Maya Angelou`,
  `"Too many of us are not living our dreams because we are living our fears."\n\n - Les Brown`,
  `"Build your own dreams, or someone else will hire you to build theirs."\n\n - Farrah Gray`,
  `"Education costs money. But then so does ignorance."\n\n - Sir Claus Moser`,
  `"It does not matter how slowly you go as long as you do not stop."\n\n - Confucius`,
  `"Dreaming, after all, is a form of planning."\n\n - Gloria Steinem`,
  `"When everything seems to be going against you, remember that the airplane takes off against the wind, not with it."\n\n - Henry Ford`,
  `"Pain is temporary. Quitting lasts forever."\n\n - Lance Armstrong`,
  `"I find that the harder I work, the more luck I seem to have."\n\n - Thomas Jefferson`,
  `"Success is the sum of small efforts repeated day-in and day-out."\n\n - Robert Collier`,
  `"We must embrace pain and burn it as fuel for our journey."\n\n - Kenji Miyazawa`,
  `"Difficult roads always lead to beautiful destinations."\n\n - Zig Ziglar`,
  `"The first and greatest victory is to conquer self."\n\n - Plato`,
  `"Success is what comes after you stop making excuses."\n\n - Luis Galarza`,
  `"Work hard in silence. Let success make the noise."\n\n - Frank Ocean`,
  `"The future belongs to those who believe in the beauty of their dreams."\n\n - Eleanor Roosevelt`,
  `"Do not go where the path may lead, go instead where there is no path and leave a trail"\n\n - Ralph Waldo Emerson`,
  `"Many of life's failures are people who did not realize how close they were to success when they gave up."\n\n - Thomas A. Edison`,
  `"May you live all the days of your life."\n\n - Jonathan Swift`,
  `"Life is ours to be spent, not to be saved."\n\n - D. H. Lawrence`,
  `"Love the life you live. Live the life you love."\n\n - Bob Marley`,
  `"Nothing is impossible, the word itself says, ‘I'm possible!'"\n\n - Audrey Hepburn`,
  `"Don't set yourself on fire to keep other people warm."\n\n – Penny Reid`,
  `"Treat yourself like someone you are responsible for helping."\n\n - Jordan B. Peterson`,
  `"Make friends with people who want the best for you."\n\n - Jordan B. Peterson`,
  `"Set your house in perfect order before you criticize the world."\n\n - Jordan B. Peterson`,
  `"Pursue what is meaningful, not what is expedient."\n\n - Jordan B. Peterson`,
  `"An aim, an ambition, provides the structure necessary for action."\n\n - Jordan B. Peterson`,
  `"There are always going to be bad things. But you can write it down and make a song out of it."\n\n - Billie Eilish`,
  `"Yes, there are two paths you can go by, but in the long run there's still time to change the road you're on."\n\n - Led Zeppelin`,
  `"Talk to yourself like you would to someone you love."\n\n - Brené Brown`,
  `"To go wrong in one's own way is better than to go right in someone else's."\n\n - Fyodor Dostoevsky`,
  `"Man only likes to count his troubles; he doesn't calculate his happiness."\n\n - Fyodor Dostoevsky`,
  `"Taking a new step, uttering a new word, is what people fear most."\n\n - Fyodor Dostoevsky`,
  `"Everything will turn out right, the world is built on that."\n\n - Mikhail Bulgakov`,
  `"There is no greater misfortune in the world than the loss of reason."\n\n - Mikhail Bulgakov`,
  `"If you're lonely when you're alone, you're in bad company."\n\n - Jean-Paul Sartre`,
  `"We are our choices."\n\n - Jean-Paul Sartre`,
  `"There may be more beautiful times, but this one is ours."\n\n - Jean-Paul Sartre`,
  `"There is nothing in the world so irresistibly contagious as laughter and good humor."\n\n - Charles Dickens`,
  `"Have a heart that never hardens, and a temper that never tires, and a touch that never hurts."\n\n - Charles Dickens`,
  `"A wonderful fact to reflect upon, that every human creature is constituted to be that profound secret and mystery to every other."\n\n - Charles Dickens`,
  `"We need never be ashamed of our tears."\n\n - Charles Dickens`,
  `"Procrastination is the thief of time, collar him."\n\n - Charles Dickens`,
  `"I hope that real love and truth are stronger in the end than any evil or misfortune in the world."\n\n - Charles Dickens`,
  `"Love is the only thing you can really give in all this world. When you give love, you give everything."\n\n - Theodore Dreiser`,
  `"A thought will color a world for us."\n\n - Theodore Dreiser`,
  `"In order to have wisdom we must have ignorance."\n\n - Theodore Dreiser`,
  `"Indulge your imagination in every possible flight."\n\n - Jane Austen`,
  `"We have all a better guide in ourselves, if we would attend to it, than any other person can be."\n\n - Jane Austen`,
  `"One man’s style must not be the rule of another’s."\n\n - Jane Austen`,
  `"There are as many forms of love as there are moments in time."\n\n - Jane Austen`,
  `"The distance is nothing when one has motive."\n\n - Jane Austen`,
  `"Reading brings us unknown friends"\n\n - Honore de Balzac `,
  `"All happiness depends on courage and work."\n\n - Honore de Balzac`,
  `"There is no such thing as a great talent without great willpower."\n\n - Honore de Balzac`,
  `"Our heart is a treasury; if you pour out all its wealth at once, you are bankrupt."\n\n - Honore de Balzac`,
  `"It is easy to sit up and take notice, What is difficult is getting up and taking action."\n\n - Honore de Balzac`,
  `"The more one judges, the less one loves."\n\n - Honore de Balzac`,
  `"Let us be grateful to the people who make us happy; they are the charming gardeners who make our souls blossom."\n\n - Marcel Proust`,
  `"Always try to keep a patch of sky above your life."\n\n - Marcel Proust`,
  `"We don't receive wisdom; we must discover it for ourselves after a journey that no one can take for us or spare us."\n\n - Marcel Proust`,
  `"Reading is that fruitful miracle of a communication in the midst of solitude."\n\n - Marcel Proust`,
  `"Mystery is not about traveling to new places but about looking with new eyes."\n\n - Marcel Proust`,
  `"You never really understand a person until you consider things from his point of view. Until you climb inside of his skin and walk around in it."\n\n - Harper Lee`,
  `"People generally see what they look for and hear what they listen for."\n\n - Harper Lee`,
  `"Things are always better in the morning."\n\n - Harper Lee`,
  `"The world is, of course, nothing but our conception of it."\n\n - Anton Chekhov`,
];
