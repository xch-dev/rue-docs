import Heading from "@theme/Heading";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Design Chia Puzzles",
    Svg: require("@site/static/img/undraw_proud_coder.svg").default,
    description: (
      <>
        Rue was built from the ground up with the goal of making it easier than
        ever before to develop Chia puzzles (smart contracts).
      </>
    ),
  },
  {
    title: "Strongly Typed",
    Svg: require("@site/static/img/undraw_code_review.svg").default,
    description: (
      <>
        The familiar syntax and type system of Rue empower you to write secure
        and maintainable code.
      </>
    ),
  },
  {
    title: "Editor Support",
    Svg: require("@site/static/img/undraw_feeling_proud.svg").default,
    description: (
      <>
        Rue has syntax highlighting and a language server, to provide realtime
        feedback on the code at compile time in editors such as VSCode.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
