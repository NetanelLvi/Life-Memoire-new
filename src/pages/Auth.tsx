
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { safeAsync } from "@/utils/errorHandler";
import { showErrorToast, showSuccessToast, ValidationError, isValidationError } from "@/utils/errorHandling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.email) {
      errors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Invalid email format");
    }
    
    if (!formData.password) {
      errors.push("Password is required");
    } else if (formData.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const error: ValidationError = {
        message: "Validation failed",
        errors: validationErrors
      };
      showErrorToast(error, "Form Validation Error");
      setIsSubmitting(false);
      return;
    }

    const { email, password } = formData;
    const authPromise = isLogin ? signIn(email, password) : signUp(email, password);

    const [_, error] = await safeAsync(authPromise, {
      errorMessage: isLogin ? "Login failed" : "Sign up failed",
      retryCount: 1,
      retryDelay: 1000,
    });

    if (error) {
      if (isValidationError(error)) {
        showErrorToast(error, "Validation Error");
      } else {
        showErrorToast(error, isLogin ? "Login Error" : "Sign Up Error");
      }
    } else {
      showSuccessToast(
        isLogin ? "Welcome back!" : "Account created successfully!",
        isLogin ? "Login Successful" : "Sign Up Successful"
      );
      if (!isLogin) {
        setIsLogin(true);
        setFormData(prev => ({ ...prev, confirmPassword: "" }));
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/06435c8d-3aa2-4f47-b98f-e959cedabf1f.png" alt="LifeMemoir Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-memoir-darkGray">LifeMemoir</h1>
          <p className="text-memoir-darkGray mt-2">Preserve your life story for generations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your account" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-memoir-darkGray opacity-70" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-memoir-darkGray opacity-70" />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-memoir-darkGray opacity-70" />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#FFD217] hover:bg-[#f8ca00] text-memoir-darkGray"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center w-full text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-[#5B9AA0] hover:underline font-medium"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
