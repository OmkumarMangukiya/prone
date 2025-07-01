import bcrypt from "bcryptjs";


export async function POST(request: Request) {

    const { email, password } = await request.json();

    if (!email || !password) {
        return new Response(JSON.stringify({ success: false, message: "Email and password are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });

    }
    return new Response(JSON.stringify({ success: true, message: "Signup successful" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}