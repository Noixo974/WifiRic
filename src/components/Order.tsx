import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Globe, Bot, MessageSquare, Palette, User, Mail, Hash, Sparkles, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface OrderProps {
  onNavigateHome: () => void;
  onNavigateContact: () => void;
}

const siteTypeOptions = [
  { value: 'vitrine', emoji: '🏪', labelKey: 'order.site_vitrine' },
  { value: 'ecommerce', emoji: '🛒', labelKey: 'order.site_ecommerce' },
  { value: 'dashboard', emoji: '📊', labelKey: 'order.site_dashboard' },
  { value: 'portfolio', emoji: '🎨', labelKey: 'order.site_portfolio' },
  { value: 'landing', emoji: '🚀', labelKey: 'order.site_landing' },
  { value: 'community', emoji: '👥', labelKey: 'order.site_community' },
  { value: 'webapp', emoji: '💻', labelKey: 'order.site_webapp' },
  { value: 'other', emoji: '✨', labelKey: 'order.site_other' },
];

export const Order: React.FC<OrderProps> = ({ onNavigateHome, onNavigateContact }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [orderType, setOrderType] = useState<'free' | 'advanced' | null>(null);
  const [projectType, setProjectType] = useState<'bot' | 'website' | null>(null);
  
  // Form state for website
  const [siteType, setSiteType] = useState('');
  const [siteTypeOther, setSiteTypeOther] = useState('');
  const [siteName, setSiteName] = useState('');
  const [logoUrls, setLogoUrls] = useState<string[]>(['']);
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#9CD4E3');
  const [otherColors, setOtherColors] = useState<string[]>([]);
  const [specificInstructions, setSpecificInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [budgetText, setBudgetText] = useState('');
  
  // Contact info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderIdError, setOrderIdError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Validation states
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSiteTypeDropdownOpen, setIsSiteTypeDropdownOpen] = useState(false);
  
  const siteTypeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (siteTypeDropdownRef.current && !siteTypeDropdownRef.current.contains(event.target as Node)) {
        setIsSiteTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateEmail = (email: string) => {
    if (!email.trim()) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateOrderId = (id: string) => {
    const regex = /^\d{8}$/;
    return regex.test(id);
  };


  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = { ...validationErrors };
    
    switch (field) {
      case 'siteName':
        if (!value.trim()) {
          errors.siteName = t('order.validation.site_name_required');
        } else if (value.trim().length < 2) {
          errors.siteName = t('order.validation.site_name_min');
        } else if (value.trim().length > 100) {
          errors.siteName = t('order.validation.site_name_max');
        } else {
          delete errors.siteName;
        }
        break;
      case 'description':
        if (!value.trim()) {
          errors.description = t('order.validation.description_required');
        } else if (value.trim().length < 20) {
          errors.description = t('order.validation.description_min');
        } else if (value.trim().length > 2000) {
          errors.description = t('order.validation.description_max');
        } else {
          delete errors.description;
        }
        break;
      case 'fullName':
        if (!value.trim()) {
          errors.fullName = t('order.validation.name_required');
        } else if (value.trim().length < 2) {
          errors.fullName = t('order.validation.name_min');
        } else if (value.trim().length > 100) {
          errors.fullName = t('order.validation.name_max');
        } else {
          delete errors.fullName;
        }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: string) => {
    return touched[field] ? validationErrors[field] : undefined;
  };

  const checkOrderIdUnique = async (id: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('orders')
      .select('order_id')
      .eq('order_id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking order ID:', error);
      return false;
    }
    return data === null;
  };

  const handleOrderIdChange = async (value: string) => {
    setOrderId(value);
    setOrderIdError('');
    
    if (value.length === 8) {
      if (!validateOrderId(value)) {
        setOrderIdError(t('order.error_id_format'));
      } else {
        const isUnique = await checkOrderIdUnique(value);
        if (!isUnique) {
          setOrderIdError(t('order.error_id_taken'));
        }
      }
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError('');
    if (value && !validateEmail(value)) {
      setEmailError(t('contact.validation.email_invalid'));
    }
  };

  const handleSiteNameChange = (value: string) => {
    setSiteName(value);
    validateField('siteName', value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    validateField('description', value);
  };

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    validateField('fullName', value);
  };


  const addLogoUrl = () => {
    setLogoUrls([...logoUrls, '']);
  };

  const updateLogoUrl = (index: number, value: string) => {
    const newUrls = [...logoUrls];
    newUrls[index] = value;
    setLogoUrls(newUrls);
  };

  const removeLogoUrl = (index: number) => {
    if (logoUrls.length > 1) {
      setLogoUrls(logoUrls.filter((_, i) => i !== index));
    }
  };

  const addOtherColor = () => {
    setOtherColors([...otherColors, '#6B7280']);
  };

  const updateOtherColor = (index: number, value: string) => {
    const newColors = [...otherColors];
    newColors[index] = value;
    setOtherColors(newColors);
  };

  const removeOtherColor = (index: number) => {
    setOtherColors(otherColors.filter((_, i) => i !== index));
  };

  const getTotalSteps = () => {
    if (!orderType) return 1;
    if (orderType === 'free') return 1;
    if (!projectType) return 2;
    if (projectType === 'bot') return 2;
    return 6; // 1: type, 2: project, 3: details, 4: contact, 5: recap, 6: success
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return orderType !== null;
      case 2:
        return projectType !== null;
      case 3:
        return siteType !== '' && siteName.trim() !== '' && description.trim() !== '';
      case 4:
        return fullName.trim() !== '' && 
               email.trim() !== '' && 
               validateEmail(email) && 
               orderId.length === 8 && 
               validateOrderId(orderId) && 
               !orderIdError;
      case 5:
        return true; // Recap step, always can proceed
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (orderType === 'free') {
      onNavigateContact();
      return;
    }
    if (projectType === 'bot') {
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, getTotalSteps()));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onNavigateHome();
    } else {
      setCurrentStep(prev => prev - 1);
      if (currentStep === 2) {
        setOrderType(null);
      }
      if (currentStep === 3) {
        setProjectType(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!canProceed() || isSubmitting) return;

    // Final validation
    if (!validateOrderId(orderId)) {
      setOrderIdError(t('order.error_id_format'));
      return;
    }

    const isUnique = await checkOrderIdUnique(orderId);
    if (!isUnique) {
      setOrderIdError(t('order.error_id_taken'));
      return;
    }

    setIsSubmitting(true);

    try {
      const filteredLogoUrls = logoUrls.filter(url => url.trim() !== '');
      
      const orderData = {
        user_id: user?.id || null,
        order_id: orderId,
        order_type: 'website',
        site_type: siteType,
        site_type_other: siteType === 'other' ? siteTypeOther : null,
        site_name: siteName,
        logo_urls: filteredLogoUrls.length > 0 ? filteredLogoUrls : null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        other_colors: otherColors.length > 0 ? otherColors : null,
        specific_instructions: specificInstructions || null,
        description: description,
        budget: budget || null,
        budget_text: budgetText || null,
        full_name: fullName,
        email: email,
        discord_username: user?.username || '',
        status: 'pending'
      };

      const { error: insertError } = await supabase
        .from('orders')
        .insert(orderData);

      if (insertError) throw insertError;

      // Send Discord notification
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.functions.invoke('send-order-to-discord', {
          body: orderData,
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
      } catch (webhookError) {
        console.error('Discord webhook error:', webhookError);
        // Don't fail the order if webhook fails
      }

      setIsSuccess(true);
      toast({
        title: t('order.success_title'),
        description: t('order.success_desc'),
      });
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: t('contact.form.error'),
        description: t('contact.form.error_desc'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSiteType = siteTypeOptions.find(opt => opt.value === siteType);

  // Step 1: Order Type Selection
  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('order.step1_title')}</h2>
        <p className="text-muted-foreground">{t('order.step1_subtitle')}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => setOrderType('free')}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
            orderType === 'free'
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
              : 'border-border hover:border-primary/50 bg-card'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-xl ${orderType === 'free' ? 'bg-primary text-white' : 'bg-muted'} transition-colors`}>
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('order.free_title')}</h3>
            <p className="text-muted-foreground text-sm">{t('order.free_desc')}</p>
          </div>
          {orderType === 'free' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        <button
          onClick={() => setOrderType('advanced')}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
            orderType === 'advanced'
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
              : 'border-border hover:border-primary/50 bg-card'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-xl ${orderType === 'advanced' ? 'bg-primary text-white' : 'bg-muted'} transition-colors`}>
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('order.advanced_title')}</h3>
            <p className="text-muted-foreground text-sm">{t('order.advanced_desc')}</p>
          </div>
          {orderType === 'advanced' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );

  // Step 2: Project Type Selection
  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('order.step2_title')}</h2>
        <p className="text-muted-foreground">{t('order.step2_subtitle')}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => setProjectType('bot')}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
            projectType === 'bot'
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
              : 'border-border hover:border-primary/50 bg-card'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-xl ${projectType === 'bot' ? 'bg-primary text-white' : 'bg-muted'} transition-colors`}>
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('order.bot_title')}</h3>
            <p className="text-muted-foreground text-sm">{t('order.bot_desc')}</p>
          </div>
          {projectType === 'bot' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        <button
          onClick={() => setProjectType('website')}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
            projectType === 'website'
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
              : 'border-border hover:border-primary/50 bg-card'
          }`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-xl ${projectType === 'website' ? 'bg-primary text-white' : 'bg-muted'} transition-colors`}>
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('order.website_title')}</h3>
            <p className="text-muted-foreground text-sm">{t('order.website_desc')}</p>
          </div>
          {projectType === 'website' && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </div>

      {projectType === 'bot' && (
        <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <p className="text-center text-foreground mb-4">{t('order.bot_discord_info')}</p>
          <div className="flex justify-center">
            <a
              href="https://discord.gg/9mKPA3kHBA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white font-semibold rounded-xl hover:bg-[#4752C4] transition-all duration-300 hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              {t('order.create_ticket')}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Website Details
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('order.step3_title')}</h2>
        <p className="text-muted-foreground">{t('order.step3_subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Site Type */}
        <div className="space-y-2" ref={siteTypeDropdownRef}>
          <label className="block text-sm font-semibold text-foreground">
            {t('order.site_type')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSiteTypeDropdownOpen(!isSiteTypeDropdownOpen)}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl text-left flex items-center justify-between hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <span className={selectedSiteType ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedSiteType ? `${selectedSiteType.emoji} ${t(selectedSiteType.labelKey)}` : t('order.select_site_type')}
              </span>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isSiteTypeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSiteTypeDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-xl shadow-xl overflow-hidden">
                {siteTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSiteType(option.value);
                      setIsSiteTypeDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-primary/10 transition-colors ${
                      siteType === option.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <span>{t(option.labelKey)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t('order.site_type_help')}</p>
        </div>

        {/* Site Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            {t('order.site_name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => handleSiteNameChange(e.target.value)}
            onBlur={() => handleFieldBlur('siteName')}
            placeholder={t('order.site_name_placeholder')}
            maxLength={100}
            className={`w-full px-4 py-3 bg-background border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
              getFieldError('siteName') ? 'border-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {getFieldError('siteName') ? (
            <p className="text-xs text-red-500">{getFieldError('siteName')}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t('order.site_name_help')}</p>
          )}
        </div>
      </div>

      {/* Other site type input */}
      {siteType === 'other' && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            {t('order.site_type_other')}
          </label>
          <input
            type="text"
            value={siteTypeOther}
            onChange={(e) => setSiteTypeOther(e.target.value)}
            placeholder={t('order.site_type_other_placeholder')}
            className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* Logo URLs */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          {t('order.logo_images')}
        </label>
        {logoUrls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateLogoUrl(index, e.target.value)}
              placeholder={t('order.logo_url_placeholder')}
              className="flex-1 px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            {logoUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeLogoUrl(index)}
                className="px-3 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addLogoUrl}
          className="text-sm text-primary hover:underline"
        >
          + {t('order.add_image_url')}
        </button>
        <p className="text-xs text-muted-foreground">{t('order.logo_help')}</p>
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
          <Palette className="w-4 h-4" />
          {t('order.colors')}
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t('order.primary_color')}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border-2 border-border rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t('order.secondary_color')}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-background border-2 border-border rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Other colors */}
        {otherColors.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t('order.other_colors')}</label>
            <div className="flex flex-wrap gap-3">
              {otherColors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateOtherColor(index, e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-border cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => removeOtherColor(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={addOtherColor}
          className="text-sm text-primary hover:underline"
        >
          + {t('order.add_color')}
        </button>
      </div>

      {/* Specific Instructions */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          {t('order.specific_instructions')}
        </label>
        <textarea
          value={specificInstructions}
          onChange={(e) => setSpecificInstructions(e.target.value)}
          placeholder={t('order.specific_instructions_placeholder')}
          rows={3}
          className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
        />
        <p className="text-xs text-muted-foreground">{t('order.specific_instructions_help')}</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">
          {t('order.description')} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          onBlur={() => handleFieldBlur('description')}
          placeholder={t('order.description_placeholder')}
          rows={5}
          maxLength={2000}
          className={`w-full px-4 py-3 bg-background border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none ${
            getFieldError('description') ? 'border-red-500' : 'border-border focus:border-primary'
          }`}
        />
        <div className="flex justify-between items-center">
          {getFieldError('description') ? (
            <p className="text-xs text-red-500">{getFieldError('description')}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t('order.validation.description_hint')}</p>
          )}
          <span className="text-xs text-muted-foreground">{description.length}/2000</span>
        </div>
      </div>

      {/* Budget */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            {t('order.budget')}
          </label>
          <div className="relative">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 pr-12 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            {t('order.budget_details')}
          </label>
          <input
            type="text"
            value={budgetText}
            onChange={(e) => setBudgetText(e.target.value)}
            placeholder={t('order.budget_details_placeholder')}
            className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('order.budget_help')}</p>
    </div>
  );

  // Step 4: Contact Info
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t('order.step4_title')}</h2>
        <p className="text-muted-foreground">{t('order.step4_subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('order.full_name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => handleFullNameChange(e.target.value)}
            onBlur={() => handleFieldBlur('fullName')}
            placeholder={t('order.full_name_placeholder')}
            maxLength={100}
            className={`w-full px-4 py-3 bg-background border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
              getFieldError('fullName') ? 'border-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {getFieldError('fullName') && (
            <p className="text-xs text-red-500">{getFieldError('fullName')}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {t('contact.form.email')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder={t('order.email_placeholder')}
            className={`w-full px-4 py-3 bg-background border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
              emailError ? 'border-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {emailError && <p className="text-xs text-red-500">{emailError}</p>}
        </div>

        {/* Order ID */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
            <Hash className="w-4 h-4" />
            {t('order.order_id')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => handleOrderIdChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="12345678"
            maxLength={8}
            className={`w-full px-4 py-3 bg-background border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
              orderIdError ? 'border-red-500' : 'border-border focus:border-primary'
            }`}
          />
          {orderIdError ? (
            <p className="text-xs text-red-500">{orderIdError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t('order.order_id_help')}</p>
          )}
        </div>

      </div>
    </div>
  );

  // Step 5: Recap
  const renderStep5 = () => {
    const getSiteTypeDisplay = () => {
      const option = siteTypeOptions.find(opt => opt.value === siteType);
      if (!option) return siteType;
      const label = t(option.labelKey);
      return `${option.emoji} ${label}${siteType === 'other' && siteTypeOther ? ` (${siteTypeOther})` : ''}`;
    };

    const filteredLogoUrls = logoUrls.filter(url => url.trim() !== '');

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('order.step5_title') || 'Récapitulatif de votre commande'}</h2>
          <p className="text-muted-foreground">{t('order.step5_subtitle') || 'Vérifiez les informations avant d\'envoyer'}</p>
        </div>

        {/* Project Info */}
        <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t('order.recap_project') || 'Informations du projet'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t('order.site_type')}:</span>
              <p className="font-medium text-foreground">{getSiteTypeDisplay()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('order.site_name')}:</span>
              <p className="font-medium text-foreground">{siteName}</p>
            </div>
          </div>
          
          {filteredLogoUrls.length > 0 && (
            <div>
              <span className="text-muted-foreground text-sm">{t('order.logo_images')}:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {filteredLogoUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline truncate max-w-[200px]">
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-muted-foreground text-sm">{t('order.colors')}:</span>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-border" style={{ backgroundColor: primaryColor }} />
                <span className="text-xs text-muted-foreground">{t('order.primary_color')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-border" style={{ backgroundColor: secondaryColor }} />
                <span className="text-xs text-muted-foreground">{t('order.secondary_color')}</span>
              </div>
              {otherColors.map((color, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-border" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          {specificInstructions && (
            <div>
              <span className="text-muted-foreground text-sm">{t('order.specific_instructions')}:</span>
              <p className="text-foreground text-sm mt-1">{specificInstructions}</p>
            </div>
          )}

          <div>
            <span className="text-muted-foreground text-sm">{t('order.description')}:</span>
            <p className="text-foreground text-sm mt-1 whitespace-pre-wrap">{description}</p>
          </div>

          {(budget || budgetText) && (
            <div className="grid md:grid-cols-2 gap-4">
              {budget && (
                <div>
                  <span className="text-muted-foreground text-sm">{t('order.budget')}:</span>
                  <p className="font-medium text-foreground">{budget} €</p>
                </div>
              )}
              {budgetText && (
                <div>
                  <span className="text-muted-foreground text-sm">{t('order.budget_details')}:</span>
                  <p className="font-medium text-foreground">{budgetText}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t('order.recap_contact') || 'Vos coordonnées'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t('order.full_name')}:</span>
              <p className="font-medium text-foreground">{fullName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('contact.form.email')}:</span>
              <p className="font-medium text-foreground">{email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('order.discord_username')}:</span>
              <p className="font-medium text-foreground">{user?.username}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('order.order_id')}:</span>
              <p className="font-medium text-foreground">#{orderId}</p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-foreground text-center">
            {t('order.recap_warning') || 'Veuillez vérifier que toutes les informations sont correctes avant de valider votre commande.'}
          </p>
        </div>
      </div>
    );
  };

  // Step 6: Success
  const renderSuccess = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
        <Check className="w-10 h-10 text-white" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t('order.success_title')}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{t('order.success_message')}</p>
      </div>
      <div className="bg-muted/50 rounded-xl p-4 max-w-md mx-auto">
        <p className="text-sm text-foreground">{t('order.success_info')}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <a
          href="https://discord.gg/9mKPA3kHBA"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5865F2] text-white font-semibold rounded-xl hover:bg-[#4752C4] transition-all duration-300 hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          {t('order.join_discord')}
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all duration-300"
        >
          {t('profile.back_home')}
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (isSuccess) return renderSuccess();
    
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  // Progress bar
  const renderProgress = () => {
    if (isSuccess || currentStep === 1 || (currentStep === 2 && projectType === 'bot')) return null;
    
    const totalSteps = projectType === 'website' ? 5 : 2; // Added recap step
    const adjustedStep = currentStep - 1; // Adjust for display
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  i + 1 < adjustedStep
                    ? 'bg-primary text-white'
                    : i + 1 === adjustedStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1 < adjustedStep ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-full h-1 mx-2 rounded transition-all duration-300 ${
                    i + 1 < adjustedStep ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{ width: '60px' }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t('order.step_project')}</span>
          <span>{t('order.step_details')}</span>
          <span>{t('order.step_contact')}</span>
          <span>{t('order.step_recap') || 'Récap'}</span>
          <span>{t('order.step_confirm')}</span>
        </div>
      </div>
    );
  };

  // If user is not logged in, show login required screen
  if (!user) {
    return (
      <section className="min-h-screen py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent mb-4">
              {t('order.title')}
            </h1>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{t('order.login_required')}</h2>
              <p className="text-muted-foreground">{t('order.login_desc')}</p>
            </div>

            <button
              onClick={() => {
                const event = new CustomEvent('openAuthModal');
                window.dispatchEvent(event);
              }}
              className="w-full group relative bg-gradient-to-r from-[#5865F2] to-[#4752C4] text-white font-semibold py-4 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#5865F2]/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4752C4] to-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="relative w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.397-.875-.609-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.08.08 0 00.087-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.294.075.075 0 01.078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 01.079.009c.12.098.246.198.373.295a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.699.772 1.365 1.225 1.994a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-4.467.151-8.35-.885-12.467a.07.07 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.931-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.191-.931 2.157-2.157 2.157zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.931-2.157 2.157-2.157 1.226 0 2.157.964 2.157 2.157 0 1.191-.931 2.157-2.157 2.157z" />
              </svg>
              <span className="relative">{t('auth.discord_button')}</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('profile.back_home')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#9cd4e3] to-blue-500 bg-clip-text text-transparent mb-4">
            {t('order.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('order.subtitle')}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-6 md:p-10 shadow-xl">
          {renderProgress()}
          
          <div className="animate-fade-in">
            {renderCurrentStep()}
          </div>

          {/* Navigation buttons */}
          {!isSuccess && !(currentStep === 2 && projectType === 'bot') && (
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('contact.back')}
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    canProceed()
                      ? 'bg-gradient-to-r from-[#9cd4e3] to-blue-500 text-white hover:shadow-lg hover:shadow-primary/30 hover:scale-105'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {orderType === 'free' ? t('order.go_to_contact') : t('profile.next')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    canProceed() && !isSubmitting
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/30 hover:scale-105'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('contact.form.sending')}
                    </>
                  ) : (
                    <>
                      {t('order.confirm_order') || 'Confirmer la commande'}
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
