from manim import *
from manim.utils.space_ops import rotate_vector


class PythagoreanProof(Scene):
    def construct(self):
        title = Text("Pythagorean Theorem", font_size=48)
        subtitle = Text("For a right triangle: a² + b² = c²", font_size=32)
        subtitle.next_to(title, DOWN)
        self.play(Write(title))
        self.play(FadeIn(subtitle))
        self.wait(1)
        self.play(FadeOut(title), FadeOut(subtitle))

        # Right triangle points
        A = np.array([0.0, 0.0, 0.0])
        B = np.array([4.0, 0.0, 0.0])
        C = np.array([0.0, 3.0, 0.0])

        triangle = Polygon(A, B, C, color=WHITE)
        right_angle = RightAngle(Line(A, B), Line(A, C), length=0.4, color=YELLOW)

        # Squares on the legs
        square_a = Square(side_length=3, color=BLUE, fill_opacity=0.4).move_to(
            A + np.array([-1.5, 1.5, 0])
        )
        square_b = Square(side_length=4, color=GREEN, fill_opacity=0.4).move_to(
            A + np.array([2.0, -2.0, 0])
        )

        # Square on the hypotenuse
        hyp_vector = C - B
        perp_vector = rotate_vector(hyp_vector, -PI / 2)
        square_c = Polygon(
            B,
            C,
            C + perp_vector,
            B + perp_vector,
            color=RED,
            fill_opacity=0.4,
        )

        a_label = MathTex("a", font_size=36).next_to(Line(A, C), LEFT)
        b_label = MathTex("b", font_size=36).next_to(Line(A, B), DOWN)
        c_label = MathTex("c", font_size=36).next_to(Line(B, C), UP)

        self.play(Create(triangle), Create(right_angle))
        self.play(Write(a_label), Write(b_label), Write(c_label))
        self.wait(0.5)

        self.play(FadeIn(square_a), FadeIn(square_b))
        self.wait(0.5)
        self.play(FadeIn(square_c))
        self.wait(0.5)

        equation = MathTex("a^2 + b^2 = c^2", font_size=48)
        equation.to_edge(UP)
        self.play(Write(equation))
        self.wait(1)

        # Visual rearrangement: show areas from a^2 and b^2 filling c^2
        square_a_copy = square_a.copy().set_fill(BLUE, opacity=0.6)
        square_b_copy = square_b.copy().set_fill(GREEN, opacity=0.6)
        self.play(square_a_copy.animate.move_to(square_c.get_center() + 0.6 * LEFT))
        self.play(square_b_copy.animate.move_to(square_c.get_center() + 0.6 * RIGHT))
        self.wait(1)

        explanation = Text(
            "The two smaller squares have the same total area\n"
            "as the big square on the hypotenuse!",
            font_size=28,
        )
        explanation.next_to(equation, DOWN)
        self.play(Write(explanation))
        self.wait(2)
